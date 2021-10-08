import { addPropertyControls, ControlType } from "framer"
import { motion } from "framer-motion"
import { _ } from "https://cdn.skypack.dev/lodash"
import {
    browser,
    checkUsername,
    checkPassword,
    globalStore,
    getMultiplayerGames,
    checkPlayerName,
    savePlayer,
    createMultiPlayerGame,
    connectToMultiplayerGame,
    updateMultiplayerGame,
    getPlayer,
    updateMultiplayerGameWithData,
    updateMultiplayerGameWithRB,
    updateMultiplayerGameWithWinner,
    data,
    savePlayerScore,
} from "./globals.ts"
import PGB from "../canvasComponent/zT4pxcM5F"
import * as React from "react"
// Learn more: https://www.framer.com/docs/guides/code-components/

export default function PGBlock(props) {
    const { text, onTap, style } = props
    const [store, setStore] = globalStore()
    const [children, setChildren] = React.useState([])
    function getColorCombo() {
        var combo = {}
        var outerColor = _.sample(store.PGB.colors)
        var innerShapeColor = _.sample(store.PGB.colors)
        var outerShapeColor = _.sample(store.PGB.colors)
        var outerShape = _.sample(store.PGB.shapes)
        var innerShape = _.sample(store.PGB.shapes)

        while (
            outerColor == outerShapeColor ||
            outerShapeColor == innerShapeColor
        ) {
            outerShapeColor = _.sample(store.PGB.colors)
            outerColor = _.sample(store.PGB.colors)
            innerShapeColor = _.sample(store.PGB.colors)
        }

        var hash =
            outerColor +
            "," +
            innerShapeColor +
            "," +
            outerShapeColor +
            "," +
            outerShape +
            "," +
            innerShape

        combo = {
            outerColor: outerColor,
            outerShapeColor: outerShapeColor,
            innerShapeColor: innerShapeColor,
            outerShape: outerShape,
            innerShape: innerShape,
            hash: hash,
        }

        return combo
    }

    const colorCombo = () => {
        var combo = {}
        combo = getColorCombo()
        while (
            _.findIndex(store.combos, (o) => {
                return o.toString() == combo["hash"]
            }) != -1
        ) {
            combo = getColorCombo()
        }

        let _combos = store.combos
        _combos.push(combo["hash"])
        setStore({ combos: _combos })

        return combo
    }

    const ontap = (hash) => {
        if (hash == data["randomBlock"]["hash"]) {
            var result = updateMultiplayerGameWithWinner(
                store.gameId,
                store.userId,
                store.supabase
            )
            savePlayerScore(store.userId, true, store.supabase)
            result.then((data) => {
                console.log(data)
            })
        }
    }

    function getBlocks() {
        var _blocks = []
        var gameData = []
        var counter = 0
        if (store.gameBlockData != "") {
            for (var i = 0; i < 8; i++) {
                for (var j = 0; j < 8; j++) {
                    let blockResult = store.gameBlockData[counter]

                    _blocks.push(
                        <PGB
                            style={{}}
                            tap={() => ontap(blockResult["hash"])}
                            innershape={blockResult["innerShape"]}
                            outershape={blockResult["outerShape"]}
                            backgroundColor={blockResult["outerColor"]}
                            outershapeColor={blockResult["outerShapeColor"]}
                            innershapeColor={blockResult["innerShapeColor"]}
                        />
                    )

                    counter++
                }
            }

            setChildren(_blocks)
        } else {
            for (var i = 0; i < 8; i++) {
                for (var j = 0; j < 8; j++) {
                    let blockResult = getColorCombo()
                    gameData.push(blockResult)
                    _blocks.push(
                        <PGB
                            style={{ transform: "translateZ(0)" }}
                            tap={() => ontap(blockResult["hash"])}
                            innershape={blockResult["innerShape"]}
                            outershape={blockResult["outerShape"]}
                            backgroundColor={blockResult["outerColor"]}
                            outershapeColor={blockResult["outerShapeColor"]}
                            innershapeColor={blockResult["innerShapeColor"]}
                        />
                    )
                }
            }

            setChildren(_blocks)
            // saving the game data online
            updateMultiplayerGameWithData(
                store.gameId,
                JSON.stringify(gameData),
                store.supabase
            )

            console.log("IS HOST: ", store.host)
            if (store.host) {
                let rb = _.sample(gameData)
                setStore({ randomBlock: rb })
                data["randomBlock"] = rb

                var result = updateMultiplayerGameWithRB(
                    store.gameId,
                    rb,
                    store.supabase
                )
                result.then((data) => {
                    console.log("RB SAVED! ", rb)
                })
            }
        }
    }

    React.useEffect(() => {
        if (children.length == 0) {
            window.setTimeout(() => getBlocks(), 300)
        }
    }, [])

    const blocks = React.Children.map(children, (child, index) => {
        return (
            <motion.div
                key={Math.random() * 10000}
                style={{
                    transform: "translateZ(0)",
                    width: "35px",
                    height: "35px",
                    marginRight: 10,
                    marginBottom: 10,
                }}
            >
                {child}
            </motion.div>
        )
    })

    return (
        <motion.div
            style={{
                ...style,
                ...containerStyle,
                width: "390px",
                height: "390px",
                paddingTop: 10,
                paddingBottom: 0,
            }}
        >
            {blocks}
        </motion.div>
    )
}

PGBlock.defaultProps = {
    text: "Tap",
}

// Learn More: https://www.framer.com/docs/property-controls/
addPropertyControls(PGBlock, {
    text: {
        title: "Text",
        type: ControlType.String,
    },
    onTap: {
        type: ControlType.EventHandler,
    },
})

const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.3)",
    flexWrap: "wrap",
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
