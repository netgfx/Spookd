import { Component, ComponentType, useEffect } from "react"
import { createStore } from "https://framer.com/m/framer/store.js@^1.0.0"
import { randomColor } from "https://framer.com/m/framer/utils.js@^0.9.0"
import { _ } from "https://cdn.skypack.dev/lodash"
import { md5 } from "https://cdn.skypack.dev/pure-md5"

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
    updateMultiplayerGameWithStart,
    updateMultiplayerGameWithRB,
    deleteGame,
    savePlayerScore,
    capitalizeFirstLetter,
    truncateString,
    cleanup,
    data,
} from "./globals.ts"
import { createClient } from "https://cdn.skypack.dev/@supabase/supabase-js"

import PGB from "../canvasComponent/zT4pxcM5F"

import Gameentry from "../canvasComponent/qY7QycjOS"
import Alien from "../canvasComponent/FSLnZyslb"
import Cowboy from "../canvasComponent/NhJ4nvx2C"
import Devil from "../canvasComponent/m0qcukIyy"
import Dracula from "../canvasComponent/xfMDjHKC3"
import Frankie from "../canvasComponent/wtzMVhSXj"
import Freddy from "../canvasComponent/xBFDpnc16"
import Grim_reaper from "../canvasComponent/pw_d4eKPe"
import Hannibal from "../canvasComponent/Y7bXyTMYm"
import IT from "../canvasComponent/ydvuOpH2Y"
import Jason from "../canvasComponent/ys8x3TnuN"
import Leprechaun from "../canvasComponent/LBeoqnb2T"
import Mummy from "../canvasComponent/fkIZ2b2L0"
import Ogre from "../canvasComponent/PcnX0sqVV"
import Pirate from "../canvasComponent/ZraCZPE5J"
import Pumpkin from "../canvasComponent/Jj9aIuzBs"
import Samara from "../canvasComponent/RL388gpzu"
import Sea_monster from "../canvasComponent/j4ES1mdIi"
import Witch from "../canvasComponent/r8WCLbhtT"
import Wolfie from "../canvasComponent/Nc4IWnUMx"
import Zombie from "../canvasComponent/qgCfmq08X"
import Zombie_girl from "../canvasComponent/TnL8QDmI8"

// Learn more: https://www.framer.com/docs/guides/overrides/

export function initDB(Component): ComponentType {
    return (props) => {
        const [store, setStore] = globalStore()
        useEffect(() => {
            if (store.supabase == null || store.supabase == undefined) {
                return
            } else {
                let supabase = store.supabase
                cleanup(store.supabase)
                var result = localStorage.getItem("player_id")
                if (result == null || result == undefined || result == "") {
                } else {
                    setStore({ userId: result, accountExists: true })
                }

                console.log(supabase)
            }
        }, [store.supabase])

        return <Component {...props} />
    }
}

export function pickAvatar(Component): ComponentType {
    return (props) => {
        const [store, setStore] = globalStore()

        const avatarPick = () => {
            var result = localStorage.getItem("player_id")
            if (result == null || result == undefined || result == "") {
                var date = new Date().getTime()
                var userId = md5((Math.random() * 10000 + date).toString())

                var userCheck = checkPlayerName(userId, store.supabase)
                userCheck.then((exists) => {
                    if (exists) {
                        userId = md5((Math.random() * 10000 + date).toString())
                        localStorage.setItem("player_id", userId)
                        savePlayer(userId, store.avatarSelected, store.supabase)
                        setStore({ userId: userId })
                    } else {
                        localStorage.setItem("player_id", userId)
                        savePlayer(userId, store.avatarSelected, store.supabase)
                        setStore({ userId: userId, accountExists: true })
                    }
                })
            } else {
                setStore({ userId: result, accountExists: true })
            }
        }

        return <Component {...props} onClick={avatarPick} />
    }
}

export function selectAvatar(Component): ComponentType {
    return (props) => {
        const [store, setStore] = globalStore()

        const avatarSelect = () => {
            setStore({
                avatarSelected: capitalizeFirstLetter(
                    props["children"]["type"]["displayName"]
                ),
            })
        }

        function getVariant(item) {
            return store.avatarSelected == capitalizeFirstLetter(item)
                ? "Variant 2"
                : "Variant 1"
        }

        return (
            <Component
                variant={getVariant(props["children"]["type"]["displayName"])}
                {...props}
                onMouseDown={avatarSelect}
            />
        )
    }
}

export function register(Component): ComponentType {
    return (props) => {
        const [store, setStore] = globalStore()

        const fetchIP = () => {
            fetch("https://ipapi.co/json/", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    //"x-api-key": apiKey,
                },
            })
                .then(async (response) => {
                    var info = await response.json()
                    var ip = info.ip
                    var address = info.city

                    const { data, error } = await store.supabase
                        .from("accounts")
                        .insert([
                            {
                                username: store.email,
                                userpass: store.pass,
                                last_login: new Date().toISOString(),
                                ip: ip,
                                location_address: address,
                                browser: browser,
                            },
                        ])

                    console.log(info)
                })
                .catch((err) => {
                    console.error(err)
                })
        }

        return <Component {...props} onClick={fetchIP} />
    }
}

/*
const mySubscription = supabase
  .from('*')
  .on('*', payload => {
    console.log('Change received!', payload)
  })
  .subscribe()
*/

export function findGames(Component): ComponentType {
    return (props) => {
        const [store, setStore] = globalStore()
        var _games
        const findGames = () => {
            _games = getMultiplayerGames(store.supabase)

            _games.then((result) => {
                console.log("games are", result)
                setStore({ games: result })
            })
        }
        return (
            <Component
                {...props}
                onClick={findGames}
                whileTap={{ scale: 0.95 }}
            />
        )
    }
}

export function checkStatus(Component): ComponentType {
    return (props) => {
        const [store, setStore] = globalStore()

        useEffect(() => {
            console.log("supabase listen")
            if (store.supabase == undefined) {
                return
            }

            const mySubscription = store.supabase
                .from("multiplayer")
                .on("*", (payload) => {
                    console.log("Change received!", payload)
                })
                .subscribe()
        }, [store.supabase])

        function getLock(pass) {
            console.log(pass, pass != "" && pass != null)
            var result = pass != "" && pass != null
            return result
        }

        const accessGame = (id) => {
            console.log("game id: ", store.gameId, id)
            const multiplayer = store.supabase
                .from("multiplayer:id=eq." + (store.gameId || id))
                .on("*", (payload) => {
                    console.log("Change received on queue room", payload)
                    var newSchema = payload["new"]
                    var players = newSchema["players"]
                    if (players.length > 1) {
                        let hostId = JSON.parse(players[0])["playerId"]
                        let id = JSON.parse(players[1])["playerId"]
                        console.log(id)
                        var player = getPlayer(id, store.supabase)
                        player.then((data) => {
                            console.log("PLAYER DATA: ", data)
                            setStore({ guestAvatar: [data.avatar] })
                        })
                        var host = getPlayer(hostId, store.supabase)
                        host.then((data) => {
                            setStore({
                                hostAvatar: [data.avatar],
                                isGuest: false,
                                isHost: true,
                            })
                        })
                    }
                })
                .subscribe()

            var result = updateMultiplayerGame(
                store.gameId || id,
                store.userId,
                null,
                store.supabase
            )

            result.then((result) => {
                setStore({
                    gameAccess: true,
                    gameName: result[0]["room_name"],
                    gameData: result[0],
                })
            })
        }

        function connect(id) {
            var result = connectToMultiplayerGame(id, store.supabase)
            result.then((gameData) => {
                let gamePass = gameData[0]["room_pass"]
                console.log(
                    "connect game: ",
                    gameData,
                    JSON.parse(gameData[0]["game_data"])
                )
                if (gamePass != "" && gamePass != null) {
                    setStore({
                        passCheck: true,
                        gameId: id,
                        gameBlockData: JSON.parse(gameData[0]["game_data"]),
                    })
                } else {
                    setStore({
                        gameId: id,
                        gameBlockData: JSON.parse(gameData[0]["game_data"]),
                    })
                    accessGame(id)
                }
            })
        }

        return (
            <Component
                {...props}
                style={{
                    gap: "10px !important",
                    backgroundColor: "rgba(0,0,0,0)",
                }}
            >
                {store.games.map((item) => (
                    <Gameentry
                        style={{ width: "100%", marginBottom: "15px" }}
                        title={item["room_name"].toString()}
                        haslock={getLock(item["room_pass"])}
                        tap={() => connect(item.id)}
                    />
                ))}
            </Component>
        )
    }
}

export function saveGameName(Component): ComponentType {
    return (props) => {
        const [store, setStore] = globalStore()

        const saveValue = (value) => {
            setStore({ gameName: value })
            console.log(value)
        }
        return (
            <Component
                {...props}
                onChange={saveValue}
                style={{
                    borderRadius: 8,
                    backgroundColor:
                        store.gameNameError == true
                            ? "rgba(255, 0, 0, 0.53)"
                            : "rgba(235, 235, 235, 0.53)",
                }}
            />
        )
    }
}

export function saveGamePass(Component): ComponentType {
    return (props) => {
        const [store, setStore] = globalStore()

        const saveValue = (value) => {
            setStore({ gamePass: value })
            console.log(value)
        }
        return (
            <Component
                {...props}
                onChange={saveValue}
                password={store.gamePassShown}
            />
        )
    }
}

export function addGamePlayers(Component): ComponentType {
    return (props) => {
        const [store, setStore] = globalStore()

        const saveValue = (value) => {
            var newVal = store.minPlayers + 1
            if (newVal > 2) {
                newVal = 2
            }
            setStore({ minPlayers: newVal })
            console.log(value)
        }
        return <Component {...props} onTap={saveValue} />
    }
}

export function removeGamePlayers(Component): ComponentType {
    return (props) => {
        const [store, setStore] = globalStore()

        const saveValue = (value) => {
            var newVal = store.minPlayers - 1
            if (newVal < 1) {
                newVal = 1
            }
            setStore({ minPlayers: newVal })
            console.log(value)
        }
        return <Component {...props} onTap={saveValue} />
    }
}

export function readGamePlayers(Component): ComponentType {
    return (props) => {
        const [store, setStore] = globalStore()

        return (
            <Component
                {...props}
                text={store.minPlayers.toString()}
                value={store.minPlayers.toString()}
            />
        )
    }
}

export function readPlayerScore(Component): ComponentType {
    return (props) => {
        const [store, setStore] = globalStore()
        const getPlayerScore = () => {
            var result = getPlayer(store.userId, store.supabase)
            result.then((data) => {
                console.log(data)
                var losses = data["total_games"] - data["wins"]
                setStore({ playerScore: data["wins"] + " - " + losses })
            })
        }

        useEffect(() => {
            getPlayerScore()
        }, [])
        return (
            <Component
                {...props}
                text={store.playerScore.toString()}
                value={store.playerScore.toString()}
            />
        )
    }
}

export function showPass(Component): ComponentType {
    return (props) => {
        const [store, setStore] = globalStore()
        const setPass = () => {
            if (store.gamePassShown == true) {
                setStore({ gamePassShown: false })
            } else {
                setStore({ gamePassShown: true })
            }
        }

        return <Component {...props} onTap={setPass} />
    }
}

export function setPassIcon(Component): ComponentType {
    return (props) => {
        const [store, setStore] = globalStore()

        function getSelection() {
            return store.gamePassShown == true ? "eye" : "eye-off"
        }
        return <Component {...props} iconSelection={getSelection()} />
    }
}

export function getGameName(Component): ComponentType {
    return (props) => {
        const [store, setStore] = globalStore()

        return (
            <Component
                {...props}
                text={truncateString(store.gameName.toString(), 15)}
            />
        )
    }
}

export function createGame(Component): ComponentType {
    return (props) => {
        const [store, setStore] = globalStore()
        var rb
        const makeGame = () => {
            if (store.gameName != "") {
                var result = createMultiPlayerGame(
                    store.gameName,
                    store.gamePass != "" ? md5(store.gamePass) : null,
                    store.minPlayers,
                    store.userId,
                    store.supabase
                )

                result.then((gameData) => {
                    console.log("GAME DATA: ", gameData, store.gameBlockData)
                    var id = gameData[0].id
                    setStore({
                        host: true,
                        gameId: gameData[0].id,
                        isHost: true,
                        isGuest: false,
                        gameNameError: false,
                    })
                    console.log(
                        "STORING HOST: ",
                        store,
                        store.host,
                        store.gameId,
                        store.hostAvatar
                    )
                    rb = _.sample(store.gameBlockData)
                    subscribeToDB(gameData)
                })
            } else {
                setStore({ gameNameError: true })
            }
        }

        function subscribeToDB(gameData) {
            var id = gameData[0].id
            store.supabase
                .from("multiplayer:id=eq." + gameData[0].id)
                .on("*", (payload) => {
                    console.log("Change received on queue room", payload, store)
                    var newSchema = payload["new"]
                    var players = newSchema["players"]

                    if (payload["eventType"] == "DELETE") {
                        console.log("DELETE DETECTED, ABORTING...")
                        // RESET
                        setStore({
                            isReady: false,
                            winnerAvatar: [],
                            loss: false,
                            winner: false,
                            guestAvatar: [],
                            isGuest: false,
                            isHost: false,
                        })
                        return
                    }

                    if (newSchema["winner"] != null) {
                        let winner = getPlayer(
                            newSchema["winner"],
                            store.supabase
                        )

                        winner.then((data) => {
                            data["winnerAvatar"] = [data["avatar"]]

                            // check if it is us
                            console.log(
                                "winner player id: ",
                                data["player_name"],
                                store.userId
                            )
                            if (data["player_name"] != store.userId) {
                                savePlayerScore(
                                    store.userId,
                                    false,
                                    store.supabase
                                )
                                setStore({
                                    winnerAvatar: [data["avatar"]],
                                    loss: true,
                                })
                            } else {
                                setStore({
                                    winnerAvatar: [data["avatar"]],
                                    winner: true,
                                })
                            }
                        })

                        return
                    }

                    if (players.length > 1 && players.length <= 2) {
                        let id = JSON.parse(players[1])["playerId"]

                        var player = getPlayer(id, store.supabase)
                        player.then((data) => {
                            setStore({ guestAvatar: [data.avatar] })
                        })
                    }

                    if (
                        players.length >= 2 ||
                        players.length == newSchema["min_players"]
                    ) {
                        console.log(
                            "started",
                            newSchema["started"].length,
                            newSchema["min_players"]
                        )
                        if (
                            newSchema["started"].length ==
                            newSchema["min_players"]
                        ) {
                            console.log("THE GAME CAN START! ", store)
                            // if this client is the host

                            // generate random block

                            console.log(
                                "Random rb: ",
                                store.randomBlock,
                                data["randomBlock"],
                                store.supabase
                            )

                            setStore({ rbReady: true })
                        }
                    }
                })
                .subscribe()
        }
        return (
            <Component
                {...props}
                onClick={makeGame}
                whileTap={{ scale: 0.95 }}
            />
        )
    }
}

export function deleteOnlineGame(Component): ComponentType {
    return (props) => {
        const [store, setStore] = globalStore()
        const _deleteGame = () => {
            var result = deleteGame(store.gameId, store.supabase)

            result.then((data) => {
                window.top.location.reload()
            })
        }
        return (
            <Component
                {...props}
                onClick={_deleteGame}
                whileTap={{ scale: 0.95 }}
            />
        )
    }
}

export function enterGame(Component): ComponentType {
    return (props) => {
        const [store, setStore] = globalStore()

        const accessGame = () => {
            const multiplayer = store.supabase
                .from("multiplayer:id=eq." + store.gameId)
                .on("*", (payload) => {
                    console.log("Change received on que room", payload)

                    if (payload["eventType"] == "DELETE") {
                        console.log("DELETE DETECTED ABORT...")
                        // RESET
                        setStore({
                            isReady: false,
                            winnerAvatar: [],
                            loss: false,
                            winner: false,
                            guestAvatar: [],
                            isGuest: false,
                            isHost: false,
                        })
                        return
                    }
                    var newSchema = payload["new"]
                    var players = newSchema["players"]
                    var targetBlock = newSchema["target_block"]

                    if (newSchema["winner"] != null) {
                        let winner = getPlayer(
                            newSchema["winner"],
                            store.supabase
                        )

                        winner.then((data) => {
                            console.log("winner ", data)
                            data["winnerAvatar"] = [data["avatar"]]
                            setStore({
                                winner: true,
                                winnerAvatar: [data["avatar"]],
                            })
                        })
                        return
                    }

                    if (players.length > 1 && players.length <= 2) {
                        let hostId = JSON.parse(players[0])["playerId"]
                        let id = JSON.parse(players[1])["playerId"]
                        console.log(id)
                        var player = getPlayer(id, store.supabase)
                        player.then((data) => {
                            console.log("PLAYER DATA: ", data)
                            setStore({
                                guestAvatar: [data.avatar],
                                isGuest: true,
                                isHost: false,
                            })
                        })
                        var host = getPlayer(hostId, store.supabase)
                        host.then((data) => {
                            setStore({ hostAvatar: [data.avatar] })
                        })
                    }

                    if (players.length >= 2) {
                        if (
                            newSchema["started"].length ==
                            newSchema["min_players"]
                        ) {
                            console.log("THE GAME CAN START!")
                            data["randomBlock"] = targetBlock
                            setStore({
                                randomBlock: targetBlock,
                                rbReady: true,
                            })
                        }
                    }
                })
                .subscribe()

            var result = updateMultiplayerGame(
                store.gameId,
                store.userId,
                md5(store.gamePass),
                store.supabase
            )

            result.then((result) => {
                if (result != false && result != undefined && result != null) {
                    setStore({
                        gameAccess: true,
                        gameName: result[0]["room_name"],
                        gameData: result[0],
                    })
                }
            })
        }
        return (
            <Component
                {...props}
                onClick={accessGame}
                whileTap={{ scale: 0.95 }}
            />
        )
    }
}

export function addAvatarHost(Component): ComponentType {
    return (props) => {
        const [store, setStore] = globalStore()

        var avatar
        function getAvatar() {
            var result = getPlayer(store.userId, store.supabase)

            result.then((userData) => {
                setStore({ hostAvatar: [userData.avatar] })
            })
        }

        const pickAvatar = (avatar) => {
            console.log("AVATAR: ", avatar)
            if (avatar == "Alien") {
                return <Alien />
            } else if (avatar == "Cowboy") {
                return <Cowboy />
            } else if (avatar == "Devil") {
                return <Devil />
            } else if (avatar == "Dracula") {
                return <Dracula />
            } else if (avatar == "Frankie") {
                return <Frankie />
            } else if (avatar == "Freddy") {
                return <Freddy />
            } else if (avatar == "Grim_reaper") {
                return <Grim_reaper />
            } else if (avatar == "Hannibal") {
                return <Hannibal />
            } else if (avatar == "IT") {
                return <IT />
            } else if (avatar == "Jason") {
                return <Jason />
            } else if (avatar == "Leprechaun") {
                return <Leprechaun />
            } else if (avatar == "Mummy") {
                return <Mummy />
            } else if (avatar == "Ogre") {
                return <Ogre />
            } else if (avatar == "Pirate") {
                return <Pirate />
            } else if (avatar == "Pumpkin") {
                return <Pumpkin />
            } else if (avatar == "Samara") {
                return <Samara />
            } else if (avatar == "Sea_monster") {
                return <Sea_monster />
            } else if (avatar == "Witch") {
                return <Witch />
            } else if (avatar == "Wolfie") {
                return <Wolfie />
            } else if (avatar == "Zombie") {
                return <Zombie />
            } else if (avatar == "Zombie_girl") {
                return <Zombie_girl />
            }
        }
        useEffect(() => {
            if (store.host || store.isHost) {
                getAvatar()
            }
        }, [])

        return (
            <Component {...props}>
                {store.hostAvatar.map((item) => pickAvatar(item))}
            </Component>
        )
    }
}

export function addAvatarGuest(Component): ComponentType {
    return (props) => {
        const [store, setStore] = globalStore()

        var avatar

        /*
        "alien",
        "cowboy",
        "devil",
        "dracula",
        "frankie",
        "freddy",
        "grim_reaper",
        "hannibal",
        "IT",
        "jason",
        "leprechaun",
        "mummy",
        "ogre",
        "pirate",
        "pumpkin",
        "samara",
        "sea_monster",
        "witch",
        "wolfie",
        "zombie",
        "zombie_girl",
        */

        const pickAvatar = (avatar) => {
            console.log("AVATAR: ", avatar)
            if (avatar == "Alien") {
                return <Alien />
            } else if (avatar == "Cowboy") {
                return <Cowboy />
            } else if (avatar == "Devil") {
                return <Devil />
            } else if (avatar == "Dracula") {
                return <Dracula />
            } else if (avatar == "Frankie") {
                return <Frankie />
            } else if (avatar == "Freddy") {
                return <Freddy />
            } else if (avatar == "Grim_reaper") {
                return <Grim_reaper />
            } else if (avatar == "Hannibal") {
                return <Hannibal />
            } else if (avatar == "IT") {
                return <IT />
            } else if (avatar == "Jason") {
                return <Jason />
            } else if (avatar == "Leprechaun") {
                return <Leprechaun />
            } else if (avatar == "Mummy") {
                return <Mummy />
            } else if (avatar == "Ogre") {
                return <Ogre />
            } else if (avatar == "Pirate") {
                return <Pirate />
            } else if (avatar == "Pumpkin") {
                return <Pumpkin />
            } else if (avatar == "Samara") {
                return <Samara />
            } else if (avatar == "Sea_monster") {
                return <Sea_monster />
            } else if (avatar == "Witch") {
                return <Witch />
            } else if (avatar == "Wolfie") {
                return <Wolfie />
            } else if (avatar == "Zombie") {
                return <Zombie />
            } else if (avatar == "Zombie_girl") {
                return <Zombie_girl />
            }
        }

        return (
            <Component {...props}>
                {store.guestAvatar.map((item) => pickAvatar(item))}
            </Component>
        )
    }
}

export function addAvatarWinner(Component): ComponentType {
    return (props) => {
        const [store, setStore] = globalStore()

        var avatar

        const pickAvatar = (avatar) => {
            console.log("AVATAR: ", avatar)
            if (avatar == "Alien") {
                return <Alien />
            } else if (avatar == "Cowboy") {
                return <Cowboy />
            } else if (avatar == "Devil") {
                return <Devil />
            } else if (avatar == "Dracula") {
                return <Dracula />
            } else if (avatar == "Frankie") {
                return <Frankie />
            } else if (avatar == "Freddy") {
                return <Freddy />
            } else if (avatar == "Grim_reaper") {
                return <Grim_reaper />
            } else if (avatar == "Hannibal") {
                return <Hannibal />
            } else if (avatar == "IT") {
                return <IT />
            } else if (avatar == "Jason") {
                return <Jason />
            } else if (avatar == "Leprechaun") {
                return <Leprechaun />
            } else if (avatar == "Mummy") {
                return <Mummy />
            } else if (avatar == "Ogre") {
                return <Ogre />
            } else if (avatar == "Pirate") {
                return <Pirate />
            } else if (avatar == "Pumpkin") {
                return <Pumpkin />
            } else if (avatar == "Samara") {
                return <Samara />
            } else if (avatar == "Sea_monster") {
                return <Sea_monster />
            } else if (avatar == "Witch") {
                return <Witch />
            } else if (avatar == "Wolfie") {
                return <Wolfie />
            } else if (avatar == "Zombie") {
                return <Zombie />
            } else if (avatar == "Zombie_girl") {
                return <Zombie_girl />
            }
        }

        return (
            <Component {...props}>
                {store.winnerAvatar.map((item) => pickAvatar(item))}
            </Component>
        )
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function checkEmail(Component): ComponentType {
    return (props) => {
        const [store, setStore] = globalStore()
        const result = (value) => {
            var usernameResult = checkUsername(value, store.supabase)
            usernameResult.then((resultValue) => {
                console.log(resultValue)
                setStore({ loginEmail: resultValue, loginEmailValue: value })
            })
        }
        return <Component {...props} onChange={result} />
    }
}

export function loginButton(Component): ComponentType {
    return (props) => {
        const [store, setStore] = globalStore()
        console.log(store.loginEmail, store.loginPass)
        const getState = () => {
            return store.loginEmail == true && store.loginPass == true
                ? {
                      disabled: false,
                      pointerEvents: "all",
                      backgroundColor: "#CB4855",
                  }
                : {
                      disabled: true,
                      pointerEvents: "none",
                      backgroundColor: "#c9c9c9",
                  }
        }
        return <Component {...props} style={getState()} />
    }
}

export function checkPass(Component): ComponentType {
    return (props) => {
        const [store, setStore] = globalStore()
        const result = (value) => {
            var passResult = checkPassword(
                store.loginEmailValue,
                md5(value),
                store.supabase
            )
            passResult.then((value) => {
                console.log(value)
                setStore({ loginPass: value })
            })
        }
        return <Component {...props} onChange={result} />
    }
}

export function saveEmail(Component): ComponentType {
    return (props) => {
        const [store, setStore] = globalStore()

        const saveValue = (value) => {
            setStore({ email: value })
            console.log(value)
        }
        return <Component {...props} onChange={saveValue} />
    }
}

export function savePass(Component): ComponentType {
    return (props) => {
        const [store, setStore] = globalStore()

        const saveValue = (value) => {
            let strength = 0

            if (value.length > 0) {
                let sizeElements = value.length

                if (sizeElements > 10) {
                    strength += 30
                } else {
                    let calcMath = sizeElements * 2

                    strength += calcMath
                }
            }

            let lowerCase = new RegExp(/[a-z]/)
            if (lowerCase.test(value)) {
                strength += 16
            }

            let upperCase = new RegExp(/[A-Z]/)
            if (upperCase.test(value)) {
                strength += 18
            }

            let regularNumber = new RegExp(/[0-9]/i)
            if (regularNumber.test(value)) {
                strength += 16
            }

            let specialChars = new RegExp(/[^a-z0-9]/i)
            if (specialChars.test(value)) {
                strength += 20
            }

            var color = "#EB544C"
            if (strength <= 40) {
                color = "#EB544C"
            } else if (strength > 40 && strength <= 60) {
                color = "#EBE84C"
            } else {
                color = "#7CEB4C"
            }

            setStore({ passStrength: strength, passColor: color })
            if (strength > 60) {
                setStore({ pass: md5(value) })
                console.log(md5(value))
            }

            console.log("Password Strength is: ", strength)
        }
        return <Component {...props} onChange={saveValue} />
    }
}

export function passStrength(Component): ComponentType {
    return (props) => {
        const [store, setStore] = globalStore()

        return (
            <Component
                {...props}
                progress={store.passStrength}
                progressColor={store.passColor}
            />
        )
    }
}

export function getEmail(Component): ComponentType {
    return (props) => {
        const [store, setStore] = globalStore()

        return <Component {...props} text={store.loginEmailValue} />
    }
}

export function startGame(Component): ComponentType {
    return (props) => {
        const [store, setStore] = globalStore()
        const start = () => setStore({ renderBlocks: true })
        return <Component {...props} onTap={start} whileTap={{ scale: 0.95 }} />
    }
}

export function pressStart(Component): ComponentType {
    return (props) => {
        const [store, setStore] = globalStore()
        const start = () => {
            console.log(props, props["children"]["props"]["variant"])
            if (store.isReady) {
                return
            }
            var result = updateMultiplayerGameWithStart(
                store.gameId,
                store.userId,
                store.supabase
            )

            result.then((data) => {
                console.log("updated DB with start: ", data)
                setStore({ isReady: true })
            })
        }

        function getVariant() {
            return store.isReady == false ? "start" : "ready"
        }
        return (
            <Component
                {...props}
                variant={getVariant()}
                onClick={start}
                whileTap={{ scale: 0.95 }}
            />
        )
    }
}

export function generateRandomBlock(Component): ComponentType {
    return (props) => {
        const [store, setStore] = globalStore()
        console.log(store.randomBlock, " --- ", data["randomBlock"])
        return (
            <Component
                {...props}
                innershape={store.randomBlock["innerShape"]}
                outershape={store.randomBlock["outerShape"]}
                backgroundColor={store.randomBlock["outerColor"]}
                outershapeColor={store.randomBlock["outerShapeColor"]}
                innershapeColor={store.randomBlock["innerShapeColor"]}
            />
        )
    }
}

export function isGuest(Component): ComponentType {
    return (props) => {
        const [store, setStore] = globalStore()

        return (
            <Component {...props} style={{ opacity: Number(store.isGuest) }} />
        )
    }
}

export function isHost(Component): ComponentType {
    return (props) => {
        const [store, setStore] = globalStore()
        console.log(isHost)
        return (
            <Component {...props} style={{ opacity: Number(store.isHost) }} />
        )
    }
}

export function createRandomBlock(Component): ComponentType {
    return (props) => {
        const [store, setStore] = globalStore()
        var blockResult = {}
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
            // console.log("Store combos: ", store.combos, combo["hash"])
            _combos.push(combo["hash"])
            setStore({ combos: _combos })

            return combo
        }

        function ontap(hash) {
            console.log(hash, " matches? ", hash == data["randomBlock"]["hash"])
        }

        useEffect(() => {
            blockResult = colorCombo()
            //console.log(colorCombo, blockResult)
        }, [store.renderBlocks])

        return (
            <Component {...props}>
                <PGB
                    tap={() => ontap(blockResult["hash"])}
                    innershape={blockResult["innerShape"]}
                    outershape={blockResult["outerShape"]}
                    backgroundColor={blockResult["outerColor"]}
                    outershapeColor={blockResult["outerShapeColor"]}
                    innershapeColor={blockResult["innerShapeColor"]}
                />
            </Component>
        )
    }
}
