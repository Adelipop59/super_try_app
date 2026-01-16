import { cn } from '@/lib/utils'

export const Logo = ({ className, uniColor }: { className?: string; uniColor?: boolean }) => {
    return (
        <svg
            viewBox="0 0 100 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn('text-foreground h-6 w-auto', className)}>
            {/* Texte Super Try uniquement */}
            <text x="0" y="18" fontFamily="system-ui, -apple-system, sans-serif" fontSize="18" fontWeight="700" fill="currentColor">
                Super Try
            </text>
        </svg>
    )
}

export const LogoIcon = ({ className, uniColor }: { className?: string; uniColor?: boolean }) => {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn('size-6', className)}>
            <rect width="24" height="24" rx="6" fill={uniColor ? 'currentColor' : 'url(#icon-gradient)'} />
            <path
                d="M7 8C7 7.44772 7.44772 7 8 7H12C14.2091 7 16 8.79086 16 11C16 12.1046 15.5259 13.0956 14.7877 13.7877M14.7877 13.7877C15.5259 14.4798 16 15.4708 16 16.5746C16 18.7837 14.2091 20.5746 12 20.5746H8C7.44772 20.5746 7 20.1268 7 19.5746V8M14.7877 13.7877H9.5"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx="18.5" cy="5.5" r="2.5" fill="#10B981" />
            <defs>
                <linearGradient
                    id="icon-gradient"
                    x1="0"
                    y1="0"
                    x2="24"
                    y2="24"
                    gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6366F1" />
                    <stop offset="1" stopColor="#8B5CF6" />
                </linearGradient>
            </defs>
        </svg>
    )
}

// Logo minimal (juste le S) pour espaces restreints
export const LogoStroke = ({ className }: { className?: string }) => {
    return (
        <svg
            className={cn('size-8', className)}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
                d="M7 8C7 7.44772 7.44772 7 8 7H12C14.2091 7 16 8.79086 16 11C16 12.1046 15.5259 13.0956 14.7877 13.7877M14.7877 13.7877C15.5259 14.4798 16 15.4708 16 16.5746C16 18.7837 14.2091 20.5746 12 20.5746H8C7.44772 20.5746 7 20.1268 7 19.5746V8M14.7877 13.7877H9.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx="18.5" cy="5.5" r="2.5" fill="#10B981" />
        </svg>
    )
}
