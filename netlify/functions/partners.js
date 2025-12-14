// Netlify Function para gerenciar parceiros
// CRUD completo: Create, Read, Update, Delete

import { AstraDB } from "@datastax/astra-db-ts";

const ASTRA_DB_API_ENDPOINT = process.env.ASTRA_DB_API_ENDPOINT;
const ASTRA_DB_APPLICATION_TOKEN = process.env.ASTRA_DB_APPLICATION_TOKEN;
const COLLECTION_NAME = "partners";

// Inicializa conexão com Astra DB
const astraDb = new AstraDB(ASTRA_DB_APPLICATION_TOKEN, ASTRA_DB_API_ENDPOINT);

export async function handler(event, context) {
    const collection = astraDb.collection(COLLECTION_NAME);
    
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle OPTIONS request for CORS
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const method = event.httpMethod;
        const path = event.path;
        const body = event.body ? JSON.parse(event.body) : {};
        const queryParams = event.queryStringParameters || {};

        // GET - Listar todos os parceiros ou buscar por ID
        if (method === 'GET') {
            const partnerId = queryParams.id;
            
            if (partnerId) {
                // Buscar parceiro específico
                const partner = await collection.findOne({ _id: partnerId });
                
                if (!partner) {
                    return {
                        statusCode: 404,
                        headers,
                        body: JSON.stringify({ error: 'Parceiro não encontrado' })
                    };
                }
                
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify(partner)
                };
            } else {
                // Listar todos os parceiros
                const activeOnly = queryParams.active === 'true';
                const filter = activeOnly ? { is_active: true } : {};
                
                const cursor = collection.find(filter, {
                    sort: { display_order: 1, created_at: -1 }
                });
                
                const partners = await cursor.toArray();
                
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify(partners)
                };
            }
        }

        // POST - Criar novo parceiro
        if (method === 'POST') {
            const newPartner = {
                _id: crypto.randomUUID(),
                name: body.name,
                description: body.description,
                phone: body.phone || '',
                email: body.email || '',
                website_url: body.website_url || '',
                course_url: body.course_url || '',
                instructor_1_name: body.instructor_1_name || '',
                instructor_1_description: body.instructor_1_description || '',
                instructor_1_phone: body.instructor_1_phone || '',
                instructor_2_name: body.instructor_2_name || '',
                instructor_2_description: body.instructor_2_description || '',
                instructor_2_phone: body.instructor_2_phone || '',
                highlights: body.highlights || [],
                images: body.images || [],
                is_active: body.is_active !== undefined ? body.is_active : true,
                display_order: body.display_order || 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            await collection.insertOne(newPartner);

            return {
                statusCode: 201,
                headers,
                body: JSON.stringify(newPartner)
            };
        }

        // PUT - Atualizar parceiro existente
        if (method === 'PUT') {
            const partnerId = body.id || queryParams.id;
            
            if (!partnerId) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'ID do parceiro é obrigatório' })
                };
            }

            const updateData = {
                ...body,
                updated_at: new Date().toISOString()
            };
            
            // Remove o ID do objeto de atualização
            delete updateData.id;
            delete updateData._id;

            const result = await collection.updateOne(
                { _id: partnerId },
                { $set: updateData }
            );

            if (result.matchedCount === 0) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ error: 'Parceiro não encontrado' })
                };
            }

            // Buscar o parceiro atualizado
            const updatedPartner = await collection.findOne({ _id: partnerId });

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(updatedPartner)
            };
        }

        // DELETE - Excluir parceiro
        if (method === 'DELETE') {
            const partnerId = queryParams.id;
            
            if (!partnerId) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'ID do parceiro é obrigatório' })
                };
            }

            const result = await collection.deleteOne({ _id: partnerId });

            if (result.deletedCount === 0) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ error: 'Parceiro não encontrado' })
                };
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ message: 'Parceiro excluído com sucesso' })
            };
        }

        // Método não suportado
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Método não permitido' })
        };

    } catch (error) {
        console.error('Erro na função partners:', error);
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
