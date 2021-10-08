import { addPropertyControls, ControlType } from "framer"
import { motion } from "framer-motion"
import * as React from "react"
import { globalStore } from "./globals.ts"
import { createClient } from "https://cdn.skypack.dev/@supabase/supabase-js"

// Learn more: https://www.framer.com/docs/guides/code-components/

export default function SupabaseConnector(props) {
    const {
        databaseURL,
        anonKey,
        databaseName1,
        databaseName2,
        databaseName3,
        databaseName4,
        databaseName5,
        databaseName6,
        style,
    } = props
    const [store, setStore] = globalStore()
    // "...style" enables switching between auto & fixed sizing
    // Learn more: https://www.framer.com/docs/guides/auto-sizing
    React.useEffect(() => {
        setStore({
            databaseName1: databaseName1,
            databaseName2: databaseName2,
            databaseName3: databaseName3,
            databaseName4: databaseName4,
            databaseName5: databaseName5,
            databaseName6: databaseName6,
        })

        if (store.supabase == null || store.supabase == undefined) {
            const supabase = createClient(databaseURL, anonKey)
            setStore({ supabase: supabase })
        }
    }, [])

    return (
        <motion.div style={{ ...style, ...containerStyle }}>
            <motion.div style={{ width: 50, height: 50 }}></motion.div>
        </motion.div>
    )
}

SupabaseConnector.defaultProps = {}

// Learn More: https://www.framer.com/docs/property-controls/
addPropertyControls(SupabaseConnector, {
    databaseURL: {
        title: "Database URL",
        type: ControlType.String,
        defaultValue: "",
    },
    anonKey: {
        title: "Database anon key",
        type: ControlType.String,
        defaultValue: "",
    },
    databaseName1: {
        title: "Database Name #1",
        type: ControlType.String,
        defaultValue: "",
    },
    databaseName2: {
        title: "Database Name #2",
        type: ControlType.String,
        defaultValue: "",
    },
    databaseName3: {
        title: "Database Name #3",
        type: ControlType.String,
        defaultValue: "",
    },
    databaseName4: {
        title: "Database Name #4",
        type: ControlType.String,
        defaultValue: "",
    },
    databaseName5: {
        title: "Database Name #5",
        type: ControlType.String,
        defaultValue: "",
    },
    databaseName6: {
        title: "Database Name #6",
        type: ControlType.String,
        defaultValue: "",
    },
})

const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    width: 50,
    height: 50,
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
