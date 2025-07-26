"use client"

import { type VariantProps, cva } from "class-variance-authority"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import type { PropsWithChildren } from "react"
import React, { useRef } from "react"

import { ny } from "@/lib/utils"

export interface DockProps extends VariantProps<typeof dockVariants> {
   className?: string
   magnification?: number
   distance?: number
   direction?: "top" | "middle" | "bottom"
   children: React.ReactNode
}

const DEFAULT_MAGNIFICATION = 0
const DEFAULT_DISTANCE = 0

const dockVariants = cva(
   "supports-backdrop-blur:bg-white/10 supports-backdrop-blur:dark:bg-black/10 mx-auto flex w-max gap-3 rounded-2xl border p-2 backdrop-blur-md",
)

const Dock = React.forwardRef<HTMLDivElement, DockProps>(
   (
      {
         className,
         children,
         magnification = DEFAULT_MAGNIFICATION,
         distance = DEFAULT_DISTANCE,
         direction = "bottom",
         ...props
      },
      ref,
   ) => {
      const mouseX = useMotionValue(Number.POSITIVE_INFINITY)

      const renderChildren = () => {
         return React.Children.map(children, (child) => {
            if (
               React.isValidElement(child) &&
               child.type === DockIcon
            ) {
               return React.cloneElement(
                  child as React.ReactElement<DockIconProps>,
                  {
                     ...(child.props || {}),
                     mouseX,
                     magnification,
                     distance,
                  }
               )
            }
            return child
         })
      }

      return (
         <motion.div
            ref={ref}
            onMouseMove={(e) => mouseX.set(e.pageX)}
            onMouseLeave={() => mouseX.set(Number.POSITIVE_INFINITY)}
            {...props}
            className={ny(dockVariants({ className }), {
               "items-start": direction === "top",
               "items-center": direction === "middle",
               "items-end": direction === "bottom",
            })}
         >
            {renderChildren()}
         </motion.div>
      )
   },
)

Dock.displayName = "Dock"

export interface DockIconProps {
   size?: number
   magnification?: number
   distance?: number
   mouseX?: any
   className?: string
   children?: React.ReactNode
   props?: PropsWithChildren
}

function DockIcon({
   size,
   magnification = DEFAULT_MAGNIFICATION,
   distance = DEFAULT_DISTANCE,
   mouseX,
   className,
   children,
   ...props
}: DockIconProps) {
   const ref = useRef<HTMLDivElement>(null)

   const distanceCalc = useTransform(mouseX, (val: number) => {
      if (!ref.current) return 0
      const bounds = ref.current.getBoundingClientRect()
      // Use left for compatibility, fallback to x if left is undefined
      const x = bounds.left ?? bounds.x ?? 0
      return val - x - bounds.width / 2
   }) || 0

   const widthSync = useTransform(
      distanceCalc,
      [-distance, 0, distance],
      [40, magnification, 40],
   )

   const width = useSpring(widthSync, {
      mass: 0.1,
      stiffness: 150,
      damping: 12,
   })

   return (
      <motion.div
         ref={ref}
         style={{ width }}
         className={ny(
            "flex aspect-square cursor-pointer items-center justify-center rounded-full",
            className,
         )}
         {...props}
      >
         {children}
      </motion.div>
   )
}

DockIcon.displayName = "DockIcon"

export { Dock, DockIcon, dockVariants }
