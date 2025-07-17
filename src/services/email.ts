'use server';

import * as nodemailer from 'nodemailer';

interface EmailOptions {
    to: string;
    subject: string;
    text: string;
    html: string;
    attachments?: Array<{
        filename: string;
        content: Buffer | string;
        contentType?: string;
        encoding?: string;
    }>;
}

export async function sendEmail(options: EmailOptions) {
    console.log('📧 Iniciando envio de email para:', options.to);
    
    // Verificar se as configurações SMTP estão disponíveis
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log("❌ Configurações SMTP não encontradas. Simulando envio de e-mail para:", options.to);
        return { success: true, message: 'Simulação de envio.', to: options.to };
    }

    console.log('🔧 Configurações SMTP encontradas:');
    console.log('   Host:', process.env.SMTP_HOST);
    console.log('   Port:', process.env.SMTP_PORT);
    console.log('   User:', process.env.SMTP_USER);
    console.log('   From Email:', process.env.SMTP_FROM_EMAIL);
    console.log('   From Name:', process.env.SMTP_FROM_NAME);

    try {
        // Criar transportador SMTP com configurações para certificados auto-assinados
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '465'),
            secure: true, // true para porta 465, false para outras portas
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                // Ignorar certificados auto-assinados
                rejectUnauthorized: false,
                ciphers: 'SSLv3'
            },
            // Configurações adicionais para estabilidade
            pool: true,
            maxConnections: 1,
            maxMessages: 3,
            rateLimit: 3
        });

        console.log('🔍 Verificando conexão SMTP...');
        
        // Verificar conexão antes de enviar
        await transporter.verify();
        console.log('✅ Conexão SMTP verificada com sucesso!');

        // Configurar e-mail
        const mailOptions = {
            from: `"${process.env.SMTP_FROM_NAME || 'SeaNutri'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
            attachments: options.attachments,
        };

        console.log('📤 Enviando email...');
        
        // Enviar e-mail
        const result = await transporter.sendMail(mailOptions);
        console.log('✅ E-mail enviado via SMTP:', result.messageId);
        return { success: true, message: 'E-mail enviado com sucesso.', messageId: result.messageId };
    } catch (error: any) {
        console.error('❌ Erro ao enviar e-mail via SMTP:', error);
        
        // Log detalhado do erro
        if (error.code) {
            console.error('   Código do erro:', error.code);
        }
        if (error.command) {
            console.error('   Comando que falhou:', error.command);
        }
        if (error.response) {
            console.error('   Resposta do servidor:', error.response);
        }
        
        return { 
            success: false, 
            message: 'Falha no envio do e-mail.', 
            error: error.message,
            details: {
                code: error.code,
                command: error.command,
                response: error.response
            }
        };
    }
}
