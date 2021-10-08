import { addPropertyControls, ControlType } from "framer"
import { motion } from "framer-motion"
import { useEffect } from "react"
import { globalStore } from "./globals.ts"

// Learn more: https://www.framer.com/docs/guides/code-components/

export default function ModalOpener(props) {
    const { onEvent, propertyListener, requireAuth, style } = props
    const [store, setStore] = globalStore()

    useEffect(() => {
        if (requireAuth) {
            if (onEvent != undefined && store.passCheck == true) {
                onEvent()
            }
        } else {
            if (onEvent != undefined && store[propertyListener] == true) {
                onEvent()
            }
        }
    }, [store[propertyListener]])
    return (
        <motion.div style={{ ...style, ...containerStyle }}>
            <motion.div
                whileTap={{
                    scale: 1.25,
                    rotate: 90,
                    backgroundColor: "#07F",
                }}
            ></motion.div>
        </motion.div>
    )
}

ModalOpener.defaultProps = {}

// Learn More: https://www.framer.com/docs/property-controls/
addPropertyControls(ModalOpener, {
    onEvent: {
        type: ControlType.EventHandler,
    },
    requireAuth: {
        type: ControlType.Boolean,
        defaultValue: true,
    },
    propertyListener: {
        type: ControlType.String,
        title: "Property Listener",
    },
})

const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
}

const squareStyle = {
    margin: 50,
    padding: 50,
    color: "white",
    fontWeight: 600,
    borderRadius: 25,
    backgroundColor: "#09F",
    width: "max-content",
    whiteSpace: "pre-wrap",
    flexShrink: 0,
}
