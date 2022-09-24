import style from '../HomePage/HomePage.module.css'
import mainImage from '../HomePage/HP-online-logo.svg'

export default function HomePage() {
    return (
        <div className={style.mainDiv}>
            <div className={style.topDiv}>
                <div className={style.leftMessage}>
                    <div className={style.mainMessage}><h1> Celebrating 20 years of real connections on Meetup</h1></div>
                    <div className={style.detailMessage}><p>Whatever you’re looking to do this year, Meetup can help. For 20 years, people have turned to Meetup to meet people, make friends, find support, grow a business, and explore their interests. Thousands of events are happening every day—join the fun.</p></div>
                </div>
                <div className={style.mainImageCard}>
                    <img className = {style.imageCard} src={mainImage} />
                </div>
            </div>
            <div className={style.bottomDiv}>
                <div className={style.groups}>
                <div>put image here</div>
                <div className = {style.subHeading}>Join a group</div>
                <div>Do what you love, meet others who love it, find your community. The rest is history!</div></div>
                <div className={style.events}>
                    <div>put event image here</div>
                    <div className = {style.subHeading}>Find an event</div>
                    <div>Events are happening on just about any topic you can think of, from online gaming and photography to yoga and hiking.</div>
                </div>
                <div className={style.createGroup}>
                    <div>put group image here</div>
                    <div className = {style.subHeading}>Start a group</div>
                    <div>You don’t have to be an expert to gather people together and explore shared interests.</div>
                </div>
            </div>
        </div>
    )
}
