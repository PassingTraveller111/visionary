import NavLayout from "@/components/NavLayout";
import CreatorSideBarLayout from "@/components/CreatorSideBarLayout";


const HomePage = () => {
    return  <NavLayout>
        <CreatorSideBarLayout
            selectedMenuKey='home'
        >
        创作中心首页
        </CreatorSideBarLayout>
    </NavLayout>
}

export default HomePage;