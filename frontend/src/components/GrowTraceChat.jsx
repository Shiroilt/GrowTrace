import { useEffect, useRef, useState } from 'react';

export default function GrowTraceChat({
    plantId = null,
    plantName = null,
    global = false,
}) {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: `Hi! I'm GrowTrace AI. Ask me anything about ${plantName || 'this plant'}.`,
        },
    ]);

    const [input, setInput] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const [loading, setLoading] = useState(false);

    const [location, setLocation] = useState(null);
    const [locationError, setLocationError] = useState(null);

    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);

    // ==========================================
    // Get browser location
    // ==========================================

    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationError('Location is not supported by this browser.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });

                setLocationError(null);
            },
            (error) => {
                console.error('Location error:', error);
                setLocationError(
                    'Location access is required for weather-aware plant analysis.'
                );
            }
        );
    }, []);

    // ==========================================
    // Auto scroll
    // ==========================================

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: 'smooth',
        });
    }, [messages, loading]);

    // ==========================================
    // Select image
    // ==========================================

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        setImage(file);

        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
    };

    // ==========================================
    // Remove image
    // ==========================================

    const removeImage = () => {
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }

        setImage(null);
        setImagePreview(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // ==========================================
    // Send message
    // ==========================================

    const handleSend = async () => {
        const question = input.trim();

        if (!question || loading) return;

        if (!location) {
            alert(
                locationError ||
                'Please allow location access before using GrowTrace AI.'
            );
            return;
        }

        const userMessage = {
            role: 'user',
            content: question,
            image: imagePreview,
        };

        setMessages((previous) => [...previous, userMessage]);

        setInput('');
        setLoading(true);

        const formData = new FormData();

        formData.append('question', question);
        formData.append('latitude', location.latitude);
        formData.append('longitude', location.longitude);

        if (image) {
            formData.append('image', image);
        }

        try {
            const endpoint = global
                ? 'http://localhost:8000/api/chat/'
                : `http://localhost:8000/api/plants/${plantId}/chat/`;

            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || 'GrowTrace AI could not answer.'
                );
            }

            setMessages((previous) => [
                ...previous,
                {
                    role: 'assistant',
                    content: data.answer,
                },
            ]);
        } catch (error) {
            console.error('GrowTrace chat error:', error);

            setMessages((previous) => [
                ...previous,
                {
                    role: 'assistant',
                    content: global
                        ? "Hi! I'm GrowTrace AI. Ask me about any of your plants or your entire botanical archive."
                        : `Hi! I'm GrowTrace AI. Ask me anything about ${plantName || 'this plant'}.`,
                    error: true,
                },
            ]);
        } finally {
            setLoading(false);
            removeImage();
        }
    };

    // ==========================================
    // Enter to send
    // ==========================================

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">

            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                        style={{ background: '#00694c' }}
                    >
                        AI
                    </div>

                    <div>
                        <p className="font-semibold text-on-surface">
                            GrowTrace AI
                        </p>

                        <p className="text-xs text-secondary">
                            {plantName
                                ? `Plant assistant · ${plantName}`
                                : 'Plant health assistant'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="h-[500px] overflow-y-auto p-5 space-y-4 bg-gray-50/50">

                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${message.role === 'user'
                            ? 'justify-end'
                            : 'justify-start'
                            }`}
                    >
                        <div
                            className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.role === 'user'
                                ? 'bg-emerald-700 text-white rounded-br-md'
                                : message.error
                                    ? 'bg-red-50 text-red-700 border border-red-100'
                                    : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-md'
                                }`}
                        >

                            {message.image && (
                                <img
                                    src={message.image}
                                    alt="Uploaded plant"
                                    className="max-h-48 rounded-xl mb-3 object-cover"
                                />
                            )}

                            <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                {message.content}
                            </p>

                        </div>
                    </div>
                ))}

                {/* Thinking */}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-md px-4 py-3">
                            <div className="flex gap-1.5">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Image preview */}
            {imagePreview && (
                <div className="px-4 pt-3 border-t border-gray-100">
                    <div className="relative inline-block">

                        <img
                            src={imagePreview}
                            alt="Selected"
                            className="w-20 h-20 object-cover rounded-xl border border-gray-200"
                        />

                        <button
                            onClick={removeImage}
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gray-900 text-white text-xs"
                        >
                            ×
                        </button>

                    </div>
                </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-100">

                <div className="flex items-end gap-2">

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                    />

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading}
                        className="w-11 h-11 flex-shrink-0 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                        title="Add plant image"
                    >
                        📷
                    </button>

                    <textarea
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={`Ask about ${plantName || 'your plant'}...`}
                        rows={1}
                        disabled={loading}
                        className="flex-1 min-h-[44px] max-h-32 resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-600 disabled:bg-gray-50"
                    />

                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || loading}
                        className="h-11 px-5 rounded-xl text-white text-sm font-semibold disabled:opacity-40"
                        style={{ background: '#00694c' }}
                    >
                        Send
                    </button>

                </div>

                <div className="mt-2 flex items-center justify-between">
                    <p className="text-[10px] text-gray-400">
                        Enter to send · Shift + Enter for new line
                    </p>

                    <p
                        className={`text-[10px] ${location
                            ? 'text-emerald-600'
                            : 'text-amber-600'
                            }`}
                    >
                        {location
                            ? '● Location available'
                            : '● Waiting for location'}
                    </p>
                </div>

            </div>

        </div>
    );
}