const Modal = ({ open, onClose, children, theme = 'blackAndWhite' }) => {
    if (!open) return null;

    const themeStyles = {
        blackAndWhite: {
            background: 'bg-white',
            text: 'text-gray-800',
            button: 'bg-gray-800 hover:bg-gray-700 text-white',
            border: 'border border-gray-200',
        },
        red: {
            background: 'bg-red-50',
            text: 'text-red-900',
            button: 'bg-red-600 hover:bg-red-700 text-white',
            border: 'border border-red-200',
        }
    };

    const currentTheme = themeStyles[theme] || themeStyles.blackAndWhite;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm transition-opacity">
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative w-full max-w-md">
                    <div className={`relative rounded-lg ${currentTheme.background} ${currentTheme.text} p-6 shadow-xl ${currentTheme.border} transition-all duration-300`}>
                        {children}
                        <div className="mt-6 flex justify-end space-x-3">
                            <button 
                                onClick={onClose} 
                                className={`rounded-lg px-4 py-2 font-medium transition-colors ${currentTheme.button}`}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Modal;