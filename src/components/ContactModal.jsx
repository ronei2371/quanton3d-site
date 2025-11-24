import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Phone, Mail, MessageSquare } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

export default function ContactModal({ isOpen, onClose }) {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        message: ''
    });
    const [status, setStatus] = useState('idle'); // idle, sending, success, error

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.email || !formData.message) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        setStatus('sending');
        try {
            const response = await fetch(`${API_URL}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Falha ao enviar, tente novamente.');
            }

            setStatus('success');
            setFormData({ name: '', phone: '', email: '', message: '' });

        } catch (error) {
            console.error('Erro ao enviar contato:', error);
            setStatus('error');
        }
    };

    const handleClose = () => {
        setStatus('idle');
        onClose();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white dark:bg-gray-800 w-full max-w-xl rounded-xl shadow-xl overflow-hidden"
            >
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Fale Conosco</h2>
                            <p className="text-blue-100">Entre em contato conosco. Estamos aqui para ajudar!</p>
                        </div>
                        <button onClick={handleClose} className="text-white hover:bg-white/20 p-2 rounded-full transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    <AnimatePresence mode="wait">
                        {status === 'success' ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-12 bg-green-50 rounded-lg border border-green-200"
                            >
                                <Check size={48} className="text-green-600 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-green-700">Mensagem Enviada com Sucesso!</h3>
                                <p className="text-gray-600 mt-2">Obrigado pelo contato! Responderemos em breve.</p>
                                <button onClick={handleClose} className="mt-6 bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                                    Fechar
                                </button>
                            </motion.div>
                        ) : (
                            <motion.form key="form" onSubmit={handleSubmit} className="space-y-4">
                                {/* Nome Completo */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Nome Completo *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Seu nome completo"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>

                                {/* Telefone */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                        <Phone className="h-4 w-4" />
                                        Telefone
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="(00) 00000-0000"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>

                                {/* E-mail */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        E-mail *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="seu@email.com"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>

                                {/* Mensagem */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4" />
                                        Deixe seu Recado *
                                    </label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="Digite sua mensagem, dúvida ou sugestão..."
                                        required
                                        rows={5}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
                                    />
                                </div>

                                {/* Botão de Envio */}
                                <button
                                    type="submit"
                                    disabled={status === 'sending'}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {status === 'sending' ? 'Enviando...' : 'Enviar Mensagem'}
                                </button>

                                {status === 'error' && (
                                    <p className="text-red-600 text-sm text-center">
                                        Erro ao enviar. Tente novamente ou entre em contato pelo WhatsApp.
                                    </p>
                                )}
                            </motion.form>
                        )}
                    </AnimatePresence>

                    {/* Informações de Contato Direto */}
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
                            Ou entre em contato diretamente:
                        </p>
                        <div className="flex flex-col gap-2 text-sm">
                            <div className="flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300">
                                <Phone className="h-4 w-4 text-blue-600" />
                                <span>(31) 3271-6935</span>
                            </div>
                            <div className="flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300">
                                <Mail className="h-4 w-4 text-blue-600" />
                                <span>atendimento@quanton3d.com.br</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
