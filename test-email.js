const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

async function testEmail() {
    console.log('🧪 Testando configurações de email...\n');

    // Verificar variáveis de ambiente
    console.log('📋 Configurações SMTP:');
    console.log('   Host:', process.env.SMTP_HOST);
    console.log('   Port:', process.env.SMTP_PORT);
    console.log('   User:', process.env.SMTP_USER);
    console.log('   From Email:', process.env.SMTP_FROM_EMAIL);
    console.log('   From Name:', process.env.SMTP_FROM_NAME);
    console.log('   Password:', process.env.SMTP_PASS ? '***configurada***' : '❌ NÃO CONFIGURADA');
    console.log('');

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.error('❌ Configurações SMTP incompletas!');
        console.log('Verifique se o arquivo .env.local existe e contém:');
        console.log('   SMTP_HOST=smtp.hostinger.com');
        console.log('   SMTP_PORT=465');
        console.log('   SMTP_USER=admin@seaocean.com.br');
        console.log('   SMTP_PASS=sua_senha_aqui');
        console.log('   SMTP_FROM_EMAIL=admin@seaocean.com.br');
        console.log('   SMTP_FROM_NAME=Sea Ocean');
        return;
    }

    try {
        // Criar transportador com configurações para certificados auto-assinados
        console.log('🔧 Criando transportador SMTP...');
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '465'),
            secure: true,
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

        // Verificar conexão
        console.log('🔍 Verificando conexão SMTP...');
        await transporter.verify();
        console.log('✅ Conexão SMTP verificada com sucesso!');

        // Configurar email de teste
        const mailOptions = {
            from: `"${process.env.SMTP_FROM_NAME || 'Sea Ocean'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
            to: 'teste@exemplo.com', // Email de teste
            subject: 'Teste de Email - Plataforma Seanutri',
            text: 'Este é um email de teste para verificar a configuração SMTP.',
            html: '<p>Este é um email de teste para verificar a configuração SMTP.</p>'
        };

        console.log('📧 Enviando email de teste...');
        const result = await transporter.sendMail(mailOptions);
        
        console.log('✅ Email enviado com sucesso!');
        console.log('   Message ID:', result.messageId);
        console.log('   From:', result.envelope.from);
        console.log('   To:', result.envelope.to);
        
        console.log('\n🎉 Configuração de email funcionando perfeitamente!');

    } catch (error) {
        console.error('❌ Erro ao testar email:', error.message);
        
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
        
        console.log('\n🔧 Sugestões para resolver:');
        console.log('1. Verifique se as credenciais SMTP estão corretas');
        console.log('2. Verifique se o servidor SMTP está acessível');
        console.log('3. Verifique se a porta 465 está liberada no firewall');
        console.log('4. Tente usar porta 587 com TLS em vez de 465 com SSL');
    }
}

testEmail(); 