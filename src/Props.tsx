import { ComponentType, useEffect } from "react"
import { createStore } from "https://framer.com/m/framer/store.js@^1.0.0"
import { randomColor } from "https://framer.com/m/framer/utils.js@^0.9.0"
import { animate, useCycle, useMotionValue } from "framer"

// Learn more: https://www.framer.com/docs/guides/overrides/

const useStore = createStore({
    background: "#0099FF",
})

export function ghostHover(Component): ComponentType {
    return (props) => {
        //const x = useMotionValue(0)
        const [y, cycleY] = useCycle(0, Math.random() * 25, 0)

        useEffect(() => {
            cycleY()
        }, [])

        return (
            <Component
                {...props}
                animate={{ y: y }}
                transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    delay: Math.random() * Math.random() * 1,
                    repeatType: "reverse",
                    ease: "easeInOut",
                }}
            />
        )
    }
}
