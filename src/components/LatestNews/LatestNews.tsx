import './LatestNews.css';
import newsTopic1 from '../../../public/assets/newstopic1.png'
import { useState } from 'react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { LuCalendar } from "react-icons/lu";

const newsTopics = [
    {
        title: 'A digital twin to sharpen our vision of extreme weather',
        url: '#todo',
        image: newsTopic1,
        date: new Date(2024, 7, 24),
    },
    {
        title: 'Article #2',
        url: '#todo',
        image: newsTopic1,
        date: new Date(2024, 2, 2),
    },
    {
        title: 'Article #3',
        url: '#todo',
        image: newsTopic1,
        date: new Date(2025, 7, 24),
    },
]

export const LatestNews = () => {
    const [news, setNews] = useState(newsTopics);
    const [currentIndex, setCurrentIndex] = useState(0);

    return (
        <div id="latest-news">
            <div
                id="latest-news-articles"
            >
                <div
                    id="latest-news-articles-container"
                    style={{
                        // transform: `translateX(-${(currentIndex / news.length )* 100}%)`
                        transform: `translateX(-${(currentIndex )* 100}%)`
                    }}
                >
                    {
                        news.map((article, idx) => (
                            <div 
                                className="article-card" 
                                key={idx}
                                style={{ backgroundImage: `url(${article.image})` }} 
                            >
                                <div className="article-title">
                                    {article.title}
                                </div>
                                <div className="article-date">
                                    <LuCalendar/>
                                    <div className="article-date-label">
                                        <div className="article-date-date">
                                            { dayjs(article.date).format('MMMM DD') }
                                        </div>
                                        <div className="article-date-year">
                                            { dayjs(article.date).format('YYYY') }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
            <div id="latest-news-pagination">
                {
                    news.map((_, idx) => (
                        <div key={idx} className={classNames({ "pagination": true, "selected": idx === currentIndex})}
                            onClick={() => setCurrentIndex(idx)}
                        />
                    ))
                }
            </div>
        </div>
    )
}

export default LatestNews;