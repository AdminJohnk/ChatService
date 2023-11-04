const RoleUser = {
  USER: '0000',
  ADMIN: '0101'
};

const HEADER = {
  API_KEY: 'x-api-key',
  CLIENT_ID: 'x-client-id',
  AUTHORIZATION: 'authorization',
  REFRESHTOKEN: 'x-rtoken-id',
  GITHUB_TOKEN: 'x-github-token'
};

const avt_default =
  'https://res.cloudinary.com/dp58kf8pw/image/upload/c_pad,b_auto:predominant,fl_preserve_transparency/v1694576962/default_avatar_ixpwcf.jpg';

const pp_UserDefault = '_id name email user_image last_online';
const se_UserDefault = ['_id', 'name', 'email', 'user_image', 'last_online'];

const se_UserDefaultForPost = [
  '_id',
  'name',
  'email',
  'user_image',
  'experiences',
  'follower_number',
  'following_number',
  'post_number'
];

const unSe_PostDefault = [
  'post_attributes.likes',
  'post_attributes.shares',
  'post_attributes.saves',
  'updatedAt',
  '__v'
];

const { REDIS_HOST, REDIS_PORT, REDIS_USERNAME, REDIS_PASSWORD } = process.env;
const objectConnectRedis = {
  username: REDIS_USERNAME,
  password: REDIS_PASSWORD,
  socket: {
    host: REDIS_HOST,
    port: REDIS_PORT
  }
};

const SETUP = 'SETUP';
const PRIVATE_MSG = 'PRIVATE_MSG';
const SEEN_MSG = 'SEEN_MSG';
const UNSEEN_MSG = 'UNSEEN_MSG';
const PRIVATE_CONVERSATION = 'PRIVATE_CONVERSATION';
const NEW_CONVERSATION = 'NEW_CONVERSATION';
const IS_TYPING = 'IS_TYPING';
const STOP_TYPING = 'STOP_TYPING';
const LEAVE_GROUP = 'LEAVE_GROUP';
const VIDEO_CALL = 'video';
const VOICE_CALL = 'audio';
const LEAVE_VIDEO_CALL = 'leave_video';
const LEAVE_VOICE_CALL = 'leave_audio';
const END_VIDEO_CALL = 'end_video';
const END_VOICE_CALL = 'end_audio';
const SEND_END_VIDEO_CALL = 'send_end_video';
const SEND_END_VOICE_CALL = 'send_end_audio';

module.exports = {
  HEADER,
  RoleUser,
  avt_default,
  se_UserDefault,
  pp_UserDefault,
  se_UserDefaultForPost,
  objectConnectRedis,
  unSe_PostDefault,
  SETUP,
  PRIVATE_MSG,
  SEEN_MSG,
  UNSEEN_MSG,
  PRIVATE_CONVERSATION,
  NEW_CONVERSATION,
  IS_TYPING,
  STOP_TYPING,
  LEAVE_GROUP,
  VIDEO_CALL,
  VOICE_CALL,
  LEAVE_VIDEO_CALL,
  LEAVE_VOICE_CALL,
  END_VIDEO_CALL,
  END_VOICE_CALL,
  SEND_END_VIDEO_CALL,
  SEND_END_VOICE_CALL
};
