/**
 * Cloud Function: user-init
 * Initializes user record and returns openid
 */

const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()

  try {
    // Check if user exists
    const userQuery = await db.collection('users').where({
      _openid: OPENID
    }).get()

    if (userQuery.data.length === 0) {
      // Create new user
      await db.collection('users').add({
        data: {
          _openid: OPENID,
          nickname: '新用户',
          avatar: '',
          vipExpireAt: 0,
          subscribeMsg: {},
          createTime: Date.now()
        }
      })
    }

    return {
      success: true,
      openid: OPENID
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}
