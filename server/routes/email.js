import express from 'express';

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
    `.trim();
    
    // TODO: Integrate with email sending service (Nodemailer, SendGrid, etc.)
    // For now, we'll simulate email sending and log the email content
    
    console.log('=== EMAIL SIMULATION ===');
    console.log('To:', destinationEmail);
    console.log('Subject:', emailSubject);
    console.log('Body:', emailBody);
    console.log('========================');
    
    // In a real implementation, you would use an email service like:
    /*
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@transcriptpro.com',
      to: destinationEmail,
      subject: emailSubject,
      text: emailBody
    });
    */
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    res.status(200).json({
      message: 'E-mail de auditoria enviado com sucesso',
      details: {
        to: destinationEmail,
        subject: emailSubject,
        aiTool: aiToolDisplayName,
        fileName: fileName,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error sending audit email:', error);
    res.status(500).json({
      message: 'Erro ao enviar e-mail de auditoria',
      error: error.message
    });
  }
});

export default router;