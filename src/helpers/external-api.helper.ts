import axios from 'axios'
import { logger } from './logger.helper'

export const getData = async (url: string, token?: string) => {
    try {
        const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` },
        })
        const data = response.data

        return data
    } catch (error) {
        logger.log('error', { name: 'getDataFromExternalApi.error', error })
        console.log(error)
    }
}
