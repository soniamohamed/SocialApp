export interface UserDataResponse {
  success: boolean
  message: string
  data: userData
}

export interface userData {
  token: string
  tokenType: string
  expiresIn: string
  user: UserInfo
}

export interface UserInfo {
  _id: string
  name: string
  username: string
  email: string
  photo: string
  cover: string
}
