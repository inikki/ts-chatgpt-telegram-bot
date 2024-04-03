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

export async function downloadFileToMemory(fileUrl: string): Promise<Buffer> {
  try {
    const response = await axios.get(fileUrl, { responseType: 'arraybuffer' })
    return response.data
  } catch (error) {
    console.error('Error downloading file:', error)
    throw error
  }
}
