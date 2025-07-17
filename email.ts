import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

// Configuração do transporter SMTP
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true, // true para 465, false para outras portas
    auth: {
      user: process.env.SMTP_USER || 'admin@seaocean.com.br',
      pass: process.env.SMTP_PASS || 'ifoP@(ie09jasp',
    },
  });
};

export async function sendEmail(options: EmailOptions) {
  // Verificar se as configurações SMTP estão disponíveis
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("Configurações SMTP não encontradas. Simulando envio de e-mail para:", options.to);
    return { success: true, message: 'Simulação de envio.', to: options.to };
  }

  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'Sea Ocean'}" <${process.env.SMTP_FROM_EMAIL || 'admin@seaocean.com.br'}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('E-mail enviado via SMTP:', result.messageId);
    return { success: true, message: 'E-mail enviado com sucesso.', result };
  } catch (error: any) {
    console.error('Erro ao enviar e-mail via SMTP:', error);
    return { success: false, message: 'Falha no envio do e-mail.', error };
  }
}

// Função p