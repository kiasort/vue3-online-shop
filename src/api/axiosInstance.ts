import axios from "axios";

export default axios.create({
    baseURL: import.meta.env.DEV ? 'http://localhost:3001' : '/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
})
