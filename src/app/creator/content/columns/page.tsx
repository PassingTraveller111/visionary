import NavLayout from "@/components/NavLayout";
import CreatorSideBarLayout from "@/components/CreatorSideBarLayout";
import CreatorList from "@/components/CreatorList";


const ColumnsPage = () => {
    return <NavLayout>
        <CreatorSideBarLayout
            selectedMenuKey='columns'
        >
            <CreatorList/>
        </CreatorSideBarLayout>
    </NavLayout>
}

export default ColumnsPage;