export type UserDto = {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    create_time: string;
    role: 0 | 1 | 2;
    profile: string;
    nick_name: string;
};

export type AuthorInfoType = Pick<UserDto, 'id' | 'email' | 'profile' | 'nick_name'>;
export type ProfileDto = Pick<UserDto, 'id' | 'username' | 'profile' | 'nick_name'>;

export type LoginRequest = {
    username: string;
    password: string;
    isRemember?: boolean;
};

export type LoginResponse = {
    status: number;
    msg?: 'success' | 'error';
    message?: string;
    data?: UserDto;
};

export type RegisterSendCodeRequest = {
    email: string;
};

export type RegisterVerifyCodeRequest = {
    email: string;
    code: string;
};

export type getAuthorInfoRequestType = {
    authorId: number;
};

export type getAuthorInfoResponseType = {
    msg: 'success' | 'error';
    data: AuthorInfoType;
};

export type getProfileRequestType = {
    userId: number;
};

export type getProfileResponseType = {
    msg: 'success' | 'error';
    data?: ProfileDto;
};

export type getUserInfoResponseType = {
    msg: 'success' | 'error';
    data: UserDto;
};

export type updateUserInfoRequestType = {
    nick_name: string;
};

export type updateUserAvatarRequestType = {
    avatarUrl: string;
};

export type statisticDataType = {
    days_count: number;
    articles_count: number;
    likes_count: number;
    collections_count: number;
    looks_count: number;
    comments_count: number;
};

export type getUserStatisticResType = {
    msg: 'success' | 'error';
    data: statisticDataType;
};

export type chartDataItemType = {
    date: string;
    like_count: number;
    read_count: number;
    collection_count: number;
    comment_count: number;
};

export type getUserStatisticChartReqType = {
    startDate: string;
    endDate: string;
};

export type getUserStatisticChartResType = {
    msg: 'success' | 'error';
    data: chartDataItemType[];
};
