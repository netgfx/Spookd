import { createStore } from "https://framer.com/m/framer/store.js@^1.0.0"
import { md5 } from "https://cdn.skypack.dev/pure-md5"
import { _ } from "https://cdn.skypack.dev/lodash"
import { Data } from "framer"

export const globalStore = createStore({
    background: "#0099FF",
    supabase: undefined,
    accountExists: false,
    email: "",
    pass: "",
    passStrength: 0,
    passColor: "#EB544C",
    loginEmailValue: "",
    loginEmail: false,
    loginPass: false,
    avatarSelected: "",
    games: [],
    gameId: "",
    gameName: "",
    gameNameError: false,
    minPlayers: 2,
    gamePass: "",
    gamePassShown: true,
    passCheck: false,
    gameAccess: false,
    host: false,
    winner: false,
    loss: false,
    hostAvatar: [],
    guestAvatar: [],
    winnerAvatar: [],
    isGuest: false,
    isHost: false,
    isReady: false,
    avatars: [
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
    ],
    playerScore: "0 - 0",
    PGB: {
        colors: ["#FF4242", "#AB4FD8", "#30D985", "#575757", "#F8E030"],
        shapes: ["Circle", "Triangle", "Square"],
    },
    randomBlock: {},
    combos: [],
    gameData: {},
    gameBlockData: [],
    renderBlocks: false,
})

export const data = Data({ winnerAvatar: [] })

export function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

export const cleanup = async (supabase) => {
    var _games
    // run some maintenance... horrible I know...
    // this should run on a server with a cronjob...
    _games = getMultiplayerGames(supabase)

    _games.then((result) => {
        console.log("games are", result)
        _.forEach(result, (value, key) => {
            console.log("a game: ", value, value["last_heartbeat"])
            var offset = new Date().getTimezoneOffset()
            var now = new Date().getTime()
            var gameTime = new Date(value["last_heartbeat"]).getTime()
            var diff =
                Math.floor(Math.abs(now - gameTime) / 1000 / 60) -
                Math.abs(offset)
            console.log("Diff is: ", diff, now, gameTime, offset)
            if (diff > 59) {
                window.setTimeout(() => {
                    deleteGame(value["id"], supabase)
                }, Math.random() * 10)
            }
        })
    })
}

export const getMultiplayerGames = async (supabase) => {
    let { data: games, error } = await supabase.from("multiplayer").select("*")

    if (games.length > 0) {
        console.log(games)
    }

    return games
}

export const checkUsername = async (email, supabase) => {
    let { data: accounts, error } = await supabase
        .from("accounts")
        .select("username")

    if (accounts.length > 0) {
        const result = accounts.filter((value) => {
            return value.username.toLowerCase() == email.toLowerCase()
        })
        if (result.length > 0) {
            return true
        } else {
            return false
        }
    } else {
        return false
    }
}

export const createMultiPlayerGame = async (
    gameName,
    gamePass,
    minPlayers,
    playerId,
    supabase
) => {
    const { data, error } = await supabase.from("multiplayer").insert([
        {
            room_name: gameName,
            room_pass: gamePass,
            min_players: minPlayers,
            players: [{ playerId: playerId }],
            updated_at: new Date().toISOString(),
            last_heartbeat: new Date().toISOString(),
        },
    ])

    return data
}

export const connectToMultiplayerGame = async (gameId, supabase) => {
    let { data: game, error } = await supabase
        .from("multiplayer")
        .select("*")
        .eq("id", gameId)

    if (game.length > 0) {
        if (game[0]["room_pass"] != "") {
            return game
        } else {
            return ""
        }
    } else {
        return null
    }
}

export const updateMultiplayerGame = async (
    gameId,
    playerId,
    gamePass,
    supabase
) => {
    let { data: game, error } = await supabase
        .from("multiplayer")
        .select("*")
        .eq("id", gameId)

    console.log("updating game: ", game)
    // if game exists
    if (game.length > 0) {
        // if password is correct

        if (game[0]["room_pass"] == gamePass || game[0]["room_pass"] == null) {
            var players = game[0]["players"]

            // if game is full
            if (players.length >= Number(game[0]["min_players"])) {
                return false
            }

            players.push({
                playerId: playerId,
            })
            const { data, _error } = await supabase
                .from("multiplayer")
                .update({ players: players })
                .eq("id", gameId)
            console.log(data, _error)

            if (_error == undefined) {
                return data
            } else {
                return false
            }
        }
    } else {
        console.log("no game found to UPDATE")
    }
}

export const updateMultiplayerGameWithData = async (
    gameId,
    gameData,
    supabase
) => {
    if (supabase != undefined) {
        const { data, _error } = await supabase
            .from("multiplayer")
            .update({ game_data: gameData })
            .eq("id", gameId)
        console.log(data, _error)

        if (_error == undefined) {
            return data
        } else {
            return false
        }
    }
}

export const updateMultiplayerGameWithWinner = async (
    gameId,
    userId,
    supabase
) => {
    if (supabase != undefined) {
        const { data, _error } = await supabase
            .from("multiplayer")
            .update({ winner: userId })
            .eq("id", gameId)
        console.log(data, _error)

        if (_error == undefined) {
            return data
        } else {
            return false
        }
    }
}

export const updateMultiplayerGameWithRB = async (gameId, rb, supabase) => {
    if (supabase != undefined) {
        const { data, _error } = await supabase
            .from("multiplayer")
            .update({ target_block: rb })
            .eq("id", gameId)
        console.log(data, _error)

        if (_error == undefined) {
            return data
        } else {
            return false
        }
    }
}

export const updateMultiplayerGameWithStart = async (
    gameId,
    userId,
    supabase
) => {
    if (supabase != undefined) {
        let { data: game, error } = await supabase
            .from("multiplayer")
            .select("*")
            .eq("id", gameId)

        console.log("updating game: ", game)
        // if game exists
        if (game.length > 0) {
            let started = game[0]["started"]
            started.push(userId)

            const { data, _error } = await supabase
                .from("multiplayer")
                .update({ started: started })
                .eq("id", gameId)
            console.log(data, _error, started)

            if (_error == undefined) {
                return data
            } else {
                return false
            }
        }
    }
}

export const deleteGame = async (gameId, supabase) => {
    const { data, error } = await supabase
        .from("multiplayer")
        .delete()
        .eq("id", gameId)

    if (data.length > 0) {
        return true
    } else {
        return false
    }
}

export const savePlayerScore = async (playerId, won, supabase) => {
    const { data, error } = await supabase
        .from("players")
        .select("*")
        .eq("player_name", playerId)

    if (data.length > 0) {
        var wins = data[0]["wins"]
        var totalGames = data[0]["total_games"]
        var finalWins = won == true ? Number(wins) + 1 : Number(wins)
        var finalTotalGames = Number(totalGames) + 1
        const { _data, error } = await supabase
            .from("players")
            .update({
                wins: finalWins,
                total_games: finalTotalGames,
                updated_at: new Date().toISOString(),
            })
            .eq("player_name", playerId)
    }
}

export const savePlayer = async (playerName, avatar, supabase) => {
    const { data, error } = await supabase.from("players").insert([
        {
            player_name: playerName,
            avatar: avatar,
            updated_at: new Date().toISOString(),
        },
    ])
}

export const getPlayer = async (playerId, supabase) => {
    const { data, error } = await supabase
        .from("players")
        .select("*")
        .eq("player_name", playerId)

    if (error == undefined) {
        if (data.length > 0) {
            return data[0]
        } else {
            return []
        }
    } else {
        return null
    }
}

export const checkPlayerName = async (name, supabase) => {
    let { data: players, error } = await supabase
        .from("players")
        .select("*")
        .eq("player_name", name)
    if (players.length > 0) {
        return true
    } else {
        return false
    }
}

export const checkPassword = async (email, pass, supabase) => {
    let { data: accounts, error } = await supabase
        .from("accounts")
        .select("userpass")
        .eq("username", email)

    if (accounts.length > 0) {
        console.log(">>>", accounts[0].userpass, pass)
        if (accounts[0].userpass == pass) {
            return true
        } else {
            return false
        }
    } else {
        return false
    }
}

export function truncateString(str, num) {
    if (str.length <= num) {
        return str
    }
    return str.slice(0, num) + "..."
}

export var browser = (function () {
    var test = function (regexp) {
        return regexp.test(window.navigator.userAgent)
    }
    switch (true) {
        case test(/edg/i):
            return "Microsoft Edge"
        case test(/trident/i):
            return "Microsoft Internet Explorer"
        case test(/firefox|fxios/i):
            return "Mozilla Firefox"
        case test(/opr\//i):
            return "Opera"
        case test(/ucbrowser/i):
            return "UC Browser"
        case test(/samsungbrowser/i):
            return "Samsung Browser"
        case test(/chrome|chromium|crios/i):
            return "Google Chrome"
        case test(/safari/i):
            return "Apple Safari"
        default:
            return "Other"
    }
})()
