// Netlify Function para upload de imagens de parceiros
// Usa Cloudinary ou similar para armazenar imagens

import multiparty from 'multiparty';
import { v2 as cloudinary } from 'cloudinary';

// Configuração do Cloudinary (adicionar no Netlify Environment Variables)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function handler(event, context) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Método não permitido' })
        };
    }

    try {
        // Parse multipart form data
        const form = new multiparty.Form();
        
        return new Promise((resolve, reject) => {
            form.parse(event, async (err, fields, files) => {
                if (err) {
                    resolve({
                        statusCode: 400,
                        headers,
                        body: JSON.stringify({ error: 'Erro ao processar upload' })
                    });
                    return;
                }

                const uploadedImages = [];

                // Upload cada arquivo para o Cloudinary
                for (const fileKey in files) {
                    const file = files[fileKey][0];
                    
                    try {
                        const result = await cloudinary.uploader.upload(file.path, {
                            folder: 'quanton3d/partners',
                            resource_type: 'image',
                            transformation: [
                                { width: 1200, height: 800, crop: 'limit' },
                                { quality: 'auto:good' }
                            ]
                        });

                        uploadedImages.push({
                            url: result.secure_url,
                            public_id: result.public_id,
                            width: result.width,
                            height: result.height
                        });
                    } catch (uploadError) {
                        console.error('Erro no upload:', uploadError);
                    }
                }

                resolve({
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        images: uploadedImages
                    })
                });
            });
        });

    } catch (error) {
        console.error('Erro na função upload:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Erro interno do servidor',
                message: error.message 
            })
        };
    }
}
