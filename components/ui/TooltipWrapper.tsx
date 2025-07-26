import * as Tooltip from '@radix-ui/react-tooltip';
import { motion } from "framer-motion";
interface TooltipWrapperProps {
    children: React.ReactNode;
    text: string;
    side?: 'top' | 'bottom' | 'left' | 'right';
    align?: 'center' | 'start' | 'end';
}
export function TooltipWrapper({
    children,
    text,
    side = 'top',
    align = 'center',
}: TooltipWrapperProps) {
    return (
        <Tooltip.Provider delayDuration={1000}>
            <Tooltip.Root>
                <Tooltip.Trigger asChild>
                    {children}
                </Tooltip.Trigger>
                <Tooltip.Portal>
                    <Tooltip.Content
                        side={side}
                        align={align}
                        sideOffset={5}
                        className="z-50 rounded-xl bg-[#110C0CBF] border-2 border-[#110C0C] text-[#eeeeee] px-3 py-1 text-md"
                        asChild
                        forceMount
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.70 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.70 }}
                            transition={{ duration: 0.25 }}
                        >
                            {text}
                            <Tooltip.Arrow className="fill-black" />
                        </motion.div>
                    </Tooltip.Content>
                </Tooltip.Portal>
            </Tooltip.Root>
        </Tooltip.Provider>
    );
}