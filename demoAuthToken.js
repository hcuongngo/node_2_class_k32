const http = require('http')
const url = require('url')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const users = [
  { email: "user1@gmail.com", password: bcrypt.hashSync("user1", 10) },
  { email: "user2@gmail.com", password: bcrypt.hashSync("user2", 10) },
]

const hashPassword = async (password) => {
  const saltRound = 10;
  return await bcrypt.hash(password, saltRound)
}

const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword)
}

const SECRET_KEY_ACCESS_TOKEN = "123"
const SECRET_KEY_REFRESH_TOKEN = "abc"
const sampleRefreshTokens = []
const generateAccessToken = (email, password) => {
  return jwt.sign({ email, password }, SECRET_KEY_ACCESS_TOKEN, { expiresIn: '1h' })
}

const generateRefreshToken = (email, password) => {
  return jwt.sign({ email, password }, SECRET_KEY_REFRESH_TOKEN, { expiresIn: '7d' })
}

const handleApiGetListUser = (req, res) => {
  res.writeHead(200, {
    "Content-Type": "application/json"
  })
  res.end(JSON.stringify({
    message: "Get list user successfully",
    data: users
  }))
}

// const handleApiRegister = (req, res) => {
//   let body = ""
//   req.on("data", (chunk) => {
//     body += chunk.toString()
//     console.log("body", body)
//   })
//   req.on("end", () => {
//     const newUser = JSON.parse(body)
//     console.log("newUser", newUser)
//     users.push(newUser)
//     res.writeHead(201, {
//       "Content-Type": "application/json"
//     })
//     res.end(JSON.stringify({
//       message: "Register successfully",
//       data: newUser
//     }))
//   })
// }

// const handleApiLogin = (req, res) => {
//   let body = ""
//   req.on("data", (chunk) => {
//     body += chunk.toString()
//   })
//   req.on("end", () => {
//     const { email, password } = JSON.parse(body)
//     const checkEmailUser = users.find(user => user.email === email)
//     if (!checkEmailUser) {
//       res.writeHead(401, {
//         "Content-Type": "text/plain"
//       })
//       res.end("Email is incorrect")
//       return
//     }
//     const checkPasswordUser = users.find(user => user.password === password)
//     if (!checkPasswordUser) {
//       res.writeHead(401, {
//         "Content-Type": "text/plain"
//       })
//       res.end("Password is incorrect")
//       return
//     }
//     res.writeHead(200, {
//       "Content-Type": "application/json"
//     })
//     res.end(JSON.stringify({
//       message: "Login successfully",
//       data: checkEmailUser
//     }))
//   })
// }

const handleApiRegister = (req, res) => {
  let body = ""
  req.on("data", (chunk) => {
    body += chunk.toString()
  })
  req.on("end", async () => {
    const newUser = JSON.parse(body)
    const hashedPassword = await hashPassword(newUser.password)
    console.log("hashedPassword", hashedPassword)
    newUser.password = hashedPassword
    users.push(newUser)
    const cloneNewUser = { ...newUser }
    delete cloneNewUser.password
    res.writeHead(201, {
      "Content-Type": "application/json"
    })
    res.end(JSON.stringify({
      message: "Register successfully",
      data: cloneNewUser
    }))
  })
}

const handleApiLogin = (req, res) => {
  let body = ""
  req.on("data", (chunk) => {
    body += chunk.toString()
  })
  req.on("end", async () => {
    const { email, password } = JSON.parse(body)
    const checkEmailUser = users.find(user => user.email === email)
    if (!checkEmailUser) {
      res.writeHead(401, {
        "Content-Type": "text/plain"
      })
      res.end("Email is incorrect")
      return
    }
    const checkPasswordUser = await comparePassword(password, checkEmailUser.password)
    if (!checkPasswordUser) {
      res.writeHead(401, {
        "Content-Type": "text/plain"
      })
      res.end("Password is incorrect")
      return
    }
    const accessToken = generateAccessToken(email, checkEmailUser.password)
    const refreshToken = generateRefreshToken(email, checkEmailUser.password)
    sampleRefreshTokens.push(refreshToken)
    const cloneCheckEmailUser = { ...checkEmailUser }
    delete cloneCheckEmailUser.password
    res.writeHead(200, {
      "Content-Type": "application/json"
    })
    res.end(JSON.stringify({
      message: "Login successfully",
      data: cloneCheckEmailUser,
      accessToken,
      refreshToken
    }))
  })
}

const handleApiRefreshToken = (req, res) => {
  const authorizationHeader = req.headers.authorization
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    res.writeHead(400, {
      "Content-Type": "text/plain"
    })
    res.end("Invalid token")
    return
  }
  const refreshToken = authorizationHeader.split(" ")[1]
  if (!refreshToken) {
    res.writeHead(400, {
      "Content-Type": "text/plain"
    })
    res.end("Invalid token")
    return
  }
  if (!sampleRefreshTokens.includes(refreshToken)) {
    res.writeHead(401, {
      "Content-Type": "text/plain"
    })
    res.end("Unauthorized")
    return
  }
  jwt.verify(refreshToken, SECRET_KEY_REFRESH_TOKEN, (err, decodedData) => {
    console.log("decodedData", decodedData)
    if (err) {
      res.writeHead(400, {
        "Content-Type": "text/plain"
      })
      res.end("Invalid token")
      return
    }
    const accessToken = generateAccessToken(decodedData.email, decodedData.password)
    res.writeHead(200, {
      "Content-Type": "application/json"
    })
    res.end(JSON.stringify({
      message: "Refresh token successfully",
      data: {
        accessToken
      }
    }))
  })
}

const handleApiChangePassword = (req, res) => {
  let body = ""
  req.on("data", (chunk) => {
    body += chunk.toString()
  })
  req.on("end", async () => {
    const { email, password, newPassword } = JSON.parse(body)
    const checkEmailUser = users.find(user => user.email === email)
    if (!checkEmailUser) {
      res.writeHead(401, {
        "Content-Type": "text/plain"
      })
      res.end("Email is incorrect")
      return
    }
    const checkPasswordUser = await comparePassword(password, checkEmailUser.password)
    if(!checkPasswordUser) {
      res.writeHead(401, {
        "Content-Type": "text/plain"
      })
      res.end("Password is incorrect")
      return
    }
    checkEmailUser.password = await hashPassword(newPassword)
    res.writeHead(200, {
      "Content-Type": "text/plain"
    })
    res.end("Change password successfully")
  })
}

const handleApiForgotPassword = (req, res) => {
  let body = ""
  req.on("data", (chunk) => {
    body += chunk.toString()
  })
  req.on("end", async () => {
    const { email, newPassword } = JSON.parse(body)
    const checkEmailUser = users.find(user => user.email === email)
    if (!checkEmailUser) {
      res.writeHead(401, {
        "Content-Type": "text/plain"
      })
      res.end("Email is incorrect")
      return
    }
    checkEmailUser.password = await hashPassword(newPassword)
    res.writeHead(200, {
      "Content-Type": "text/plain"
    })
    res.end("Reset password successfully")
  })
}

const handleApiLogout = (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/plain"
  })
  res.end("Logout successfully")
}

const server = http.createServer((req, res) => {
  const parseUrl = url.parse(req.url, true)
  const path = parseUrl.pathname
  if (req.method === "GET" && path === "/api/users") {
    handleApiGetListUser(req, res)
  } else if (req.method === "POST" && path === "/api/auth/register") {
    handleApiRegister(req, res)
  } else if (req.method === "POST" && path === "/api/auth/login") {
    handleApiLogin(req, res)
  } else if (req.method === "POST" && path === "/api/auth/refresh-token") {
    handleApiRefreshToken(req, res)
  } else if (req.method === "POST" && path === "/api/auth/change-password") {
    handleApiChangePassword(req, res) 
  } else if (req.method === "POST" && path === "/api/auth/forgot-password") {
    handleApiForgotPassword(req, res)
  } else if (req.method === "POST" && path === "/api/auth/logout") {
    handleApiLogout(req, res)
  }
  else {
    res.writeHead(404, {
      "Content-Type": "text/plain"
    })
    res.end("Not found")
  }
})

server.listen(3000, () => {
  console.log("Server is running on port 3000")
})