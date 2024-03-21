import app from './app'

const port = process.env.PORT || 8080

const initServer = async () => {
    app.listen(port, () => {
        console.log(`Listening on port ${port}`)
    })
}

initServer()
