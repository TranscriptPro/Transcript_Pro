import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

// Send transcription email for audit
router.post('/send-email', async (req, res) => {
  try {
    const { transcription, fileName, aiTool, auditRules, destinationEmail } = req.body;
    
    // Validate required fields
    if (!transcription || !fileName || !destinationEmail) {
      return res.status(400).json({
        message: 'Campos obrigatórios: transcription, fileName, destinationEmail'
      });
    }
    
    // Map AI tool names to display names
    const aiToolNames = {
      'chatgpt': 'ChatGPT',
      'grok': 'Grok',
      'gemini': 'Gemini'
    };
    
    const aiToolDisplayName = aiToolNames[aiTool] || aiTool;
    
    // Construct email subject
    const emailSubject = `Auditoria de Transcrição - ${fileName}`;
    
    // Construct email body
    const emailBody = `
Prezado(a) Auditor(a),

Segue abaixo a transcrição do arquivo "${fileName}" para auditoria:

=== INFORMAÇÕES DA AUDITORIA ===
Ferramenta de IA sugerida: ${aiToolDisplayName}
Data de processamento: ${new Date().toLocaleString('pt-BR')}

=== REGRAS DE AUDITORIA ===
${auditRules || 'Nenhuma regra específica definida.'}

=== TRANSCRIÇÃO ===
${transcription}

=== INSTRUÇÕES ===
Por favor, revise a transcrição acima seguindo as regras de auditoria especificadas.
Utilize a ferramenta de IA sugerida (${aiToolDisplayName}) para auxiliar na análise, se necessário.

Atenciosamente,
Sistema TranscriptPro
mg.transcriptpro@gmail.com
    `.trim();
    
    // Check if email configuration is available
    const emailConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASS;
    
    if (emailConfigured) {
      try {
        // Create transporter for Gmail
        const transporter = nodemailer.createTransporter({
          host: process.env.EMAIL_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.EMAIL_PORT) || 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: process.env.EMAIL_USER, // mg.transcriptpro@gmail.com
            pass: process.env.EMAIL_PASS  // App password from Gmail
          }
        });
        
        // Send email
        const info = await transporter.sendMail({
          from: `"TranscriptPro" <${process.env.EMAIL_FROM || 'mg.transcriptpro@gmail.com'}>`,
          to: destinationEmail,
          subject: emailSubject,
          text: emailBody,
          html: emailBody.replace(/\n/g, '<br>').replace(/===/g, '<strong>===').replace(/===/g, '===</strong>')
        });
        
        console.log('Email sent successfully:', info.messageId);
        
        res.status(200).json({
          message: 'E-mail de auditoria enviado com sucesso',
          details: {
            to: destinationEmail,
            subject: emailSubject,
            aiTool: aiToolDisplayName,
            fileName: fileName,
            timestamp: new Date().toISOString(),
            messageId: info.messageId
          }
        });
        
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        throw new Error(`Falha ao enviar e-mail: ${emailError.message}`);
      }
    } else {
      // Email not configured - simulate sending for development
      console.log('=== EMAIL SIMULATION (Email not configured) ===');
      console.log('From: mg.transcriptpro@gmail.com');
      console.log('To:', destinationEmail);
      console.log('Subject:', emailSubject);
      console.log('Body:', emailBody);
      console.log('===============================================');
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      res.status(200).json({
        message: 'E-mail simulado com sucesso (configuração de e-mail necessária para envio real)',
        details: {
          to: destinationEmail,
          subject: emailSubject,
          aiTool: aiToolDisplayName,
          fileName: fileName,
          timestamp: new Date().toISOString(),
          note: 'Configure EMAIL_USER e EMAIL_PASS no arquivo .env para envio real'
        }
      });
    }
    
  } catch (error) {
    console.error('Error sending audit email:', error);
    res.status(500).json({
      message: 'Erro ao enviar e-mail de auditoria',
      error: error.message
    });
  }
});

export default router;