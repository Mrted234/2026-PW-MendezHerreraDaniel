const MINI_SERVIDOR_URL = "http://localhost:3000"
const BACKEND_URL ="http://localhost:3006"

/**@type{import("next").NextConfig} */
module.exports = {
    reactStringMode : true,
    async rewrites(){
        return[
            {source: "/mini/:path*", destination: `{MINI_SERVIDOR_URL}/api/:path*`},
            {source: "/mini/:path*", destination: `{BACKEND_URL}/api/:path*`},
        ]
    }
}