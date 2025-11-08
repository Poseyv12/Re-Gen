import groq from "groq";

export const PRAYER_FIELDS = `
  _id,
  _createdAt,
  name,
  isAnonymous,
  title,
  content,
  group,
  status,
  prayedCount,
  "userId": user._ref,
  "userName": user->name
`;

export const queryApprovedPrayers = groq`
  *[_type == "prayerRequest" && status == "approved"] | order(_createdAt desc) {
    ${PRAYER_FIELDS}
  }
`;

export const queryPrayerById = groq`
  *[_type == "prayerRequest" && _id == $id && status == "approved"][0] {
    ${PRAYER_FIELDS},
    "comments": *[_type == "comment" && prayerRequest._ref == ^._id && !defined(parentComment)] | order(createdAt asc) {
      _id,
      content,
      createdAt,
      "user": user->{
        _id,
        name
      },
      "likes": likes[]->{
        _id,
        name
      },
      "replies": *[_type == "comment" && parentComment._ref == ^._id] | order(createdAt asc) {
        _id,
        content,
        createdAt,
        "user": user->{
          _id,
          name
        },
        "likes": likes[]->{
          _id,
          name
        }
      }
    }
  }
`;

export const queryPendingPrayers = groq`
  *[_type == "prayerRequest" && status == "pending"] | order(_createdAt asc) {
    ${PRAYER_FIELDS}
  }
`;

export const queryAllPrayers = groq`
  *[_type == "prayerRequest"] | order(_createdAt desc) {
    ${PRAYER_FIELDS}
  }
`;

export const queryUserPrayers = groq`
  *[_type == "prayerRequest" && status == "approved" && (user._ref == $userId || name == $name) && !isAnonymous] | order(_createdAt desc) {
    ${PRAYER_FIELDS}
  }
`;

export const queryUserProfile = groq`
  *[_type == "user" && _id == $userId][0] {
    _id,
    name,
    email,
    image,
    createdAt,
    "following": following[]->{
      _id,
      name,
      image
    },
    "followers": followers[]->{
      _id,
      name,
      image
    },
    "prayerCount": count(*[_type == "prayerRequest" && status == "approved" && name == ^.name && !isAnonymous])
  }
`;

export const queryFeedPrayers = groq`
  *[_type == "prayerRequest" && status == "approved" && !isAnonymous && defined(user) && user._ref in *[_type == "user" && _id == $userId].following[]._ref] | order(_createdAt desc) {
    ${PRAYER_FIELDS}
  }
`;

export const queryDailyReflections = groq`
  *[_type == "dailyReflection" && isPublished == true] | order(date desc) {
    _id,
    _createdAt,
    title,
    date,
    content,
    author,
    scripture,
    isPublished
  }
`;

export const queryTodayReflection = groq`
  *[_type == "dailyReflection" && isPublished == true && date == $date][0] {
    _id,
    _createdAt,
    title,
    date,
    content,
    author,
    scripture,
    isPublished
  }
`;

export const queryAllReflections = groq`
  *[_type == "dailyReflection"] | order(date desc) {
    _id,
    _createdAt,
    title,
    date,
    content,
    author,
    scripture,
    isPublished
  }
`;

export const queryAllUsers = groq`
  *[_type == "user"] | order(_createdAt desc) {
    _id,
    name,
    email,
    image,
    createdAt,
    _createdAt
  }
`;

export const TESTIMONY_FIELDS = `
  _id,
  _createdAt,
  name,
  isAnonymous,
  title,
  content,
  group,
  status,
  encouragedCount,
  "userId": user._ref,
  "userName": user->name
`;

export const queryApprovedTestimonies = groq`
  *[_type == "testimony" && status == "approved"] | order(_createdAt desc) {
    ${TESTIMONY_FIELDS}
  }
`;

export const queryTestimonyById = groq`
  *[_type == "testimony" && _id == $id && status == "approved"][0] {
    ${TESTIMONY_FIELDS}
  }
`;

export const queryPendingTestimonies = groq`
  *[_type == "testimony" && status == "pending"] | order(_createdAt asc) {
    ${TESTIMONY_FIELDS}
  }
`;

export const queryAllTestimonies = groq`
  *[_type == "testimony"] | order(_createdAt desc) {
    ${TESTIMONY_FIELDS}
  }
`;
