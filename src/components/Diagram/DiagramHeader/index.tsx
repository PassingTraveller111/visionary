'use client'
import styles from './index.module.scss';
import RootPlugins from "@/components/Diagram/DiagramHeader/Plugins/RootPlugins";



const DiagramHeader = () => {
    return <div className={styles.HeaderContainer}>
        <div
            className={styles.header}
        >
            header
        </div>
        <div
            className={styles.toolbar}
        >
            <div className={styles.toolbarLeft}>
                {
                    RootPlugins
                        .filter(Plugin => Plugin.config.align !== 'right')
                        .map((Plugin) => {
                            return <Plugin key={Plugin.name}/>
                        })
                }
            </div>
            <div className={styles.toolbarRight}>
                {
                    RootPlugins
                        .filter(Plugin => Plugin.config.align === 'right')
                        .map((Plugin) => {
                            return <Plugin key={Plugin.name}/>
                        })
                }
            </div>
        </div>
    </div>
}


export default DiagramHeader;