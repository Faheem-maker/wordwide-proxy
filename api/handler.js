export default async function handler(req, res) {
    const TARGET_BASE_URL = "http://wordwide.atwebpages.com"

    // ---- Handle CORS preflight ----
    if (req.method === "OPTIONS") {
        res.status(200)
            .setHeader("Access-Control-Allow-Origin", "https://faheemanis.rf.gd")
            .setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
            .setHeader("Access-Control-Allow-Headers", "*")
            .end()
        return
    }

    // Build target URL
    const path = req.query.path || ""
    const targetUrl = `${TARGET_BASE_URL}/${path}`

    // Copy headers (remove hop-by-hop ones)
    const headers = { ...req.headers }
    delete headers.host
    delete headers.connection
    delete headers["content-length"]

    const contentType = req.headers["content-type"] || ""

    let body
    if (req.method === "GET" || req.method === "HEAD") {
        body = undefined
    } else if (contentType.includes("application/json")) {
        body = JSON.stringify(req.body)
    } else {
        body = req.body
    }

    // Forward request
    const upstreamResponse = await fetch(targetUrl, {
        method: req.method,
        headers,
        body,
    })

    // Copy response headers
    upstreamResponse.headers.forEach((value, key) => {
        res.setHeader(key, value)
    })

    // CORS headers (important)
    res.setHeader("Access-Control-Allow-Origin", "https://faheemanis.rf.gd")
    res.setHeader("Access-Control-Allow-Credentials", "true")

    // Return response
    res.status(upstreamResponse.status)

    const buffer = Buffer.from(await upstreamResponse.arrayBuffer())
    res.send(buffer)
}