import {useAppSelector} from "@/store";

type ProfileProps = {
    width?: number;
    height?: number;
}

export const Profile = (props: ProfileProps) => {
    const { width=30, height=30 } = props;
    const { profile='' } = useAppSelector(state => state.rootReducer.userReducer.value);
    console.log('profile', profile);

    return <img src={profile} alt="profile" style={{ width: width, height: height }} />
}