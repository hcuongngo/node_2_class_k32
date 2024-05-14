const http = require('http')
const url = require('url')

const items = [
  { id: 1, name: "item 1", description: "description 1" },
  { id: 2, name: "item 2", description: "description 2" },
  { id: 3, name: "item 3", description: "description 3" },
]

// request response 
const handleApiGetListItem = (req, res) => {
  const parseUrl = url.parse(req.url, true)
  console.log("parseUrl", parseUrl)
  console.log("typeof parseUrl", typeof parseUrl)
  const path = parseUrl.pathname
  if (path === "/api/items") {
    res.writeHead(200, {
      "Content-Type": "application/json"
    })
    res.end(JSON.stringify({
      message: "Get items successfully",
      data: items
    }))
  } else {
    res.writeHead(404, {
      "Content-Type": "text/plain"
    })
    res.end("Not found")
  }
}

const handleApiGetItemDetailById = (req, res) => {
  const parseUrl = url.parse(req.url, true)
  const pathSegments = parseUrl.pathname.split("/")
  console.log("pathSegments", pathSegments)
}

const server = http.createServer((req, res) => {
  const parseUrl = url.parse(req.url, true)
  const path = parseUrl.pathname
  const pathSegments = path.split("/")
  console.log("pathSegments", pathSegments)
  const itemId = parseInt(pathSegments[pathSegments.length - 1])
  if (req.method === "GET" && path === "/api/items") {
    handleApiGetListItem(req, res)
  }
})

server.listen(3000, () => {
  console.log("Server is running on port 3000")
})



