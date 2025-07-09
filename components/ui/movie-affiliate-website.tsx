"use client";

import React, { useState, useRef, useEffect, useLayoutEffect, memo, useMemo, useCallback } from "react";
import { motion, AnimatePresence, useAnimation, useMotionValue, useTransform, Variants } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  MapPin,
  Calendar as CalendarIcon,
  Clock,
  Star,
  Users,
  ChevronLeft,
  ChevronRight,
  Ticket,
  Menu,
  X,
  Film,
  User,
  Instagram,
  Twitter,
  Github,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";

interface Movie {
  id: number;
  title: string;
  title_he?: string;
  poster_path_en: string;
  poster_path_he?: string;
  backdrop_path: string;
  overview: string;
  overview_he?: string;
  release_date: string;
  vote_average: number;
  runtime: number;
  trailer_url?: string;
  videos?: Video[];
  cast?: CastMember[];
  keywords?: Keyword[];
}

interface Video {
  id: string;
  name: string;
  name_he?: string;
  key: string;
  type: 'Trailer' | 'Teaser' | 'Clip' | 'Behind the Scenes';
  thumbnail: string;
  duration: number;
}

interface CastMember {
  id: number;
  name: string;
  name_he?: string;
  character: string;
  character_he?: string;
  profile_path: string;
  order: number;
}

interface RecommendedMovie {
  id: number;
  title: string;
  title_he?: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  release_date: string;
  genre: string;
}

interface Keyword {
  id: number;
  name: string;
  name_he?: string;
}

interface Article {
  id: number;
  title: string;
  title_he?: string;
  excerpt: string;
  excerpt_he?: string;
  image: string;
  author: string;
  author_he?: string;
  date: string;
  readTime: number;
  category: string;
  category_he?: string;
}

interface Review {
  id: number;
  author: string;
  author_he?: string;
  rating: number;
  content: string;
  content_he?: string;
  date: string;
  verified: boolean;
  helpful: number;
  avatar: string;
}

interface Theater {
  id: number;
  name: string;
  name_he?: string;
  logo: string;
  distance: number;
  showtimes: string[];
  availability: number;
}

interface ShowtimeData {
  theaters: Theater[];
  dates: Date[];
}

const defaultMovie: Movie = {
  id: 1,
  title: "Dune: Part Two",
  title_he: "דיונה: חלק שני",
  poster_path_en: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
  poster_path_he: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
  backdrop_path: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
  overview: "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family.",
  overview_he: "עקבו אחר המסע המיתי של פול אטריידס כשהוא מתאחד עם צ'אני והפרמן בדרך נקמה נגד הקושרים שהרסו את משפחתו.",
  release_date: "2024-02-29",
  vote_average: 8.4,
  runtime: 166,
  trailer_url: "https://videos.pexels.com/video-files/30333849/13003128_2560_1440_25fps.mp4",
  videos: [
    {
      id: "1",
      name: "Official Trailer",
      name_he: "טריילר רשמי",
      key: "30333849",
      type: "Trailer",
      thumbnail: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
      duration: 180
    },
    {
      id: "2",
      name: "Behind the Scenes",
      name_he: "מאחורי הקלעים",
      key: "30333850",
      type: "Behind the Scenes",
      thumbnail: "https://image.tmdb.org/t/p/w500/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
      duration: 240
    },
    {
      id: "3",
      name: "Character Featurette",
      name_he: "דמויות הסרט",
      key: "30333851",
      type: "Clip",
      thumbnail: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
      duration: 120
    }
  ],
  cast: [
    {
      id: 1,
      name: "Timothée Chalamet",
      name_he: "טימותי שאלמה",
      character: "Paul Atreides",
      character_he: "פול אטריידס",
      profile_path: "https://image.tmdb.org/t/p/w185/BE2sdjpgsa2rNTFa66f7upDZplE.jpg",
      order: 0
    },
    {
      id: 2,
      name: "Zendaya",
      name_he: "זנדיה",
      character: "Chani",
      character_he: "צ'אני",
      profile_path: "https://image.tmdb.org/t/p/w185/kg2VKKHOQgKZqJGJLnLEKKWFIIU.jpg",
      order: 1
    },
    {
      id: 3,
      name: "Rebecca Ferguson",
      name_he: "רבקה פרגוסון",
      character: "Lady Jessica",
      character_he: "ליידי ג'סיקה",
      profile_path: "https://image.tmdb.org/t/p/w185/lJloTOheuQSirSLXNA3JHsrMNfH.jpg",
      order: 2
    },
    {
      id: 4,
      name: "Josh Brolin",
      name_he: "ג'וש ברולין",
      character: "Gurney Halleck",
      character_he: "גורני האלק",
      profile_path: "https://image.tmdb.org/t/p/w185/sX2etBbIkxRaCsATyw5ZpOVMPTD.jpg",
      order: 3
    },
    {
      id: 5,
      name: "Austin Butler",
      name_he: "אוסטין באטלר",
      character: "Feyd-Rautha",
      character_he: "פייד-ראות'ה",
      profile_path: "https://image.tmdb.org/t/p/w185/krCWEXOGbKKZJsOQqF3hPWN6ZSO.jpg",
      order: 4
    },
    {
      id: 6,
      name: "Florence Pugh",
      name_he: "פלורנס פיו",
      character: "Princess Irulan",
      character_he: "הנסיכה אירולן",
      profile_path: "https://image.tmdb.org/t/p/w185/6Sjz9teWjrMY9lF2o9FCo4XmoRh.jpg",
      order: 5
    }
  ],
  keywords: [
    { id: 1, name: "Space Opera", name_he: "אופרת חלל" },
    { id: 2, name: "Desert Planet", name_he: "כוכב מדבר" },
    { id: 3, name: "Political Intrigue", name_he: "מזימות פוליטיות" },
    { id: 4, name: "Prophecy", name_he: "נבואה" },
    { id: 5, name: "War", name_he: "מלחמה" },
    { id: 6, name: "Power Struggle", name_he: "מאבק כוח" },
    { id: 7, name: "Revenge", name_he: "נקמה" },
    { id: 8, name: "Leadership", name_he: "מנהיגות" }
  ]
};

const recommendedMovies: RecommendedMovie[] = [
  {
    id: 2,
    title: "Oppenheimer",
    title_he: "אופנהיימר",
    poster_path: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg",
    vote_average: 8.3,
    release_date: "2023-07-21",
    genre: "Biography"
  },
  {
    id: 3,
    title: "Blade Runner 2049",
    title_he: "בלייד ראנר 2049",
    poster_path: "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/ilKBPyx1rveC2bT52xzNJydqzCx.jpg",
    vote_average: 8.0,
    release_date: "2017-10-06",
    genre: "Sci-Fi"
  },
  {
    id: 4,
    title: "Interstellar",
    title_he: "אינטרסטלר",
    poster_path: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg",
    vote_average: 8.6,
    release_date: "2014-11-07",
    genre: "Sci-Fi"
  },
  {
    id: 5,
    title: "Arrival",
    title_he: "הגעה",
    poster_path: "https://image.tmdb.org/t/p/w500/yImmxRokQ48PD49ughXdpKTAsAU.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/yIZ1xendyqKvY3FGeeUYUd5X9Mm.jpg",
    vote_average: 7.9,
    release_date: "2016-11-11",
    genre: "Sci-Fi"
  },
  {
    id: 6,
    title: "The Batman",
    title_he: "הבאטמן",
    poster_path: "https://image.tmdb.org/t/p/w500/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/qqHQsStV6exghCM7zbObuYBiYxw.jpg",
    vote_average: 7.8,
    release_date: "2022-03-04",
    genre: "Action"
  }
];

const relatedArticles: Article[] = [
  {
    id: 1,
    title: "The Making of Dune: Part Two - Behind the Scenes",
    title_he: "יצירת דיונה: חלק שני - מאחורי הקלעים",
    excerpt: "Director Denis Villeneuve reveals the secrets behind creating the epic sequel that fans have been waiting for.",
    excerpt_he: "הבמאי דני וילנב חושף את הסודות מאחורי יצירת ההמשך האפי שהמעריצים חיכו לו.",
    image: "https://image.tmdb.org/t/p/w500/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
    author: "Sarah Johnson",
    author_he: "שרה ג'ונסון",
    date: "2024-03-15",
    readTime: 8,
    category: "Behind the Scenes",
    category_he: "מאחורי הקלעים"
  },
  {
    id: 2,
    title: "Timothée Chalamet's Transformation into Paul Atreides",
    title_he: "ההפיכה של טימותי שאלמה לפול אטריידס",
    excerpt: "How the young actor prepared for one of the most challenging roles in science fiction cinema.",
    excerpt_he: "איך השחקן הצעיר התכונן לאחד התפקידים המאתגרים ביותר בקולנוע המדע הבדיוני.",
    image: "https://image.tmdb.org/t/p/w500/BE2sdjpgsa2rNTFa66f7upDZplE.jpg",
    author: "Michael Chen",
    author_he: "מייקל צ'ן",
    date: "2024-03-10",
    readTime: 6,
    category: "Actor Spotlight",
    category_he: "זרקור שחקנים"
  },
  {
    id: 3,
    title: "The Visual Effects Revolution in Dune: Part Two",
    title_he: "מהפכת האפקטים החזותיים בדיונה: חלק שני",
    excerpt: "Exploring the groundbreaking visual effects that brought the desert planet Arrakis to life.",
    excerpt_he: "חקירת האפקטים החזותיים פורצי הדרך שהביאו את כוכב המדבר אראקיס לחיים.",
    image: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    author: "Emma Rodriguez",
    author_he: "אמה רודריגז",
    date: "2024-03-08",
    readTime: 10,
    category: "Technology",
    category_he: "טכנולוגיה"
  }
];

const movieReviews: Review[] = [
  {
    id: 1,
    author: "Alex Thompson",
    author_he: "אלכס תומפסון",
    rating: 9.5,
    content: "Absolutely stunning! Denis Villeneuve has outdone himself with this masterpiece. The cinematography, sound design, and performances are all top-notch. This is how you make a sequel.",
    content_he: "מדהים לחלוטין! דני וילנב עלה על עצמו עם יצירת המופת הזו. הצילום, עיצוב הקול והביצועים כולם ברמה הגבוהה ביותר. ככה עושים המשך.",
    date: "2024-03-20",
    verified: true,
    helpful: 234,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: 2,
    author: "Maria Santos",
    author_he: "מריה סנטוס",
    rating: 8.8,
    content: "Visually spectacular and emotionally engaging. Timothée Chalamet delivers a powerful performance as Paul Atreides. The world-building is incredible.",
    content_he: "מרהיב חזותית ומרגש רגשית. טימותי שאלמה מעניק ביצוע עוצמתי בתור פול אטריידס. בניית העולם מדהימה.",
    date: "2024-03-18",
    verified: true,
    helpful: 189,
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: 3,
    author: "David Kim",
    author_he: "דיוויד קים",
    rating: 9.2,
    content: "A worthy successor to the first film. The action sequences are breathtaking, and the story keeps you engaged throughout. Hans Zimmer's score is phenomenal.",
    content_he: "יורש ראוי לסרט הראשון. סצנות הפעולה עוצרות נשימה, והסיפור שומר על המעורבות לאורך כל הדרך. הפרטיטורה של הנס צימר פנומנלית.",
    date: "2024-03-16",
    verified: false,
    helpful: 156,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: 4,
    author: "Jennifer Walsh",
    author_he: "ג'ניפר וולש",
    rating: 8.5,
    content: "Epic in every sense of the word. The film successfully balances intimate character moments with grand spectacle. Zendaya shines in her expanded role.",
    content_he: "אפי בכל מובן של המילה. הסרט מצליח לאזן רגעי דמויות אינטימיים עם מחזה גרנדיוזי. זנדיה זוהרת בתפקידה המורחב.",
    date: "2024-03-14",
    verified: true,
    helpful: 203,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
  }
];

const defaultShowtimes: ShowtimeData = {
  theaters: [
    {
      id: 1,
      name: "Cinema City Glilot",
      name_he: "סינמה סיטי גלילות",
      logo: "🎬",
      distance: 2.5,
      showtimes: ["14:30", "17:00", "20:30", "23:00"],
      availability: 85
    },
    {
      id: 2,
      name: "Yes Planet Rishon",
      name_he: "יס פלאנט ראשון לציון",
      logo: "🎭",
      distance: 8.2,
      showtimes: ["15:00", "18:15", "21:45"],
      availability: 92
    },
    {
      id: 3,
      name: "Lev Dizengoff",
      name_he: "לב דיזנגוף",
      logo: "🎪",
      distance: 12.1,
      showtimes: ["16:00", "19:30", "22:15"],
      availability: 67
    }
  ],
  dates: [
    new Date(),
    new Date(Date.now() + 86400000),
    new Date(Date.now() + 172800000),
    new Date(Date.now() + 259200000),
    new Date(Date.now() + 345600000)
  ]
};

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const CustomSlider = ({
  value,
  onChange,
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}) => {
  return (
    <motion.div
      className={cn(
        "relative w-full h-1 bg-white/20 rounded-full cursor-pointer",
        className
      )}
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = (x / rect.width) * 100;
        onChange(Math.min(Math.max(percentage, 0), 100));
      }}
    >
      <motion.div
        className="absolute top-0 left-0 h-full bg-white rounded-full"
        style={{ width: `${value}%` }}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    </motion.div>
  );
};

const TrailerModal = ({
  isOpen,
  onClose,
  src
}: {
  isOpen: boolean;
  onClose: () => void;
  src: string;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (value: number) => {
    if (videoRef.current) {
      const newVolume = value / 100;
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(isFinite(progress) ? progress : 0);
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (value: number) => {
    if (videoRef.current && videoRef.current.duration) {
      const time = (value / 100) * videoRef.current.duration;
      if (isFinite(time)) {
        videoRef.current.currentTime = time;
        setProgress(value);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative w-full max-w-4xl mx-auto rounded-xl overflow-hidden bg-black shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
          >
            <video
              ref={videoRef}
              className="w-full aspect-video"
              onTimeUpdate={handleTimeUpdate}
              src={src}
              onClick={togglePlay}
            />

            <AnimatePresence>
              {showControls && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-white text-sm">
                      {formatTime(currentTime)}
                    </span>
                    <CustomSlider
                      value={progress}
                      onChange={handleSeek}
                      className="flex-1"
                    />
                    <span className="text-white text-sm">{formatTime(duration)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button
                        onClick={togglePlay}
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20"
                      >
                        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                      </Button>

                      <div className="flex items-center gap-2">
                        <Button
                          onClick={toggleMute}
                          variant="ghost"
                          size="icon"
                          className="text-white hover:bg-white/20"
                        >
                          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                        </Button>
                        <div className="w-24">
                          <CustomSlider
                            value={volume * 100}
                            onChange={handleVolumeChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface AnimatedTextProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string;
  gradientColors?: string;
  gradientAnimationDuration?: number;
  hoverEffect?: boolean;
  className?: string;
  textClassName?: string;
}

const AnimatedText = React.forwardRef<HTMLDivElement, AnimatedTextProps>(
  (
    {
      text,
      gradientColors = "linear-gradient(90deg, #000, #fff, #000)",
      gradientAnimationDuration = 1,
      hoverEffect = false,
      className,
      textClassName,
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = React.useState(false);

    const textVariants: Variants = {
      initial: {
        backgroundPosition: "0 0",
      },
      animate: {
        backgroundPosition: "100% 0",
        transition: {
          duration: gradientAnimationDuration,
          repeat: Infinity,
          repeatType: "reverse" as const,
        },
      },
    };

    return (
      <div
        ref={ref}
        className={cn("flex justify-center items-center", className)}
        {...props}
      >
        <motion.span
          className={cn("inline-block", textClassName)}
          style={{
            background: gradientColors,
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: isHovered ? "0 0 8px rgba(255,255,255,0.3)" : "none",
          }}
          variants={textVariants}
          initial="initial"
          animate="animate"
          onHoverStart={() => hoverEffect && setIsHovered(true)}
          onHoverEnd={() => hoverEffect && setIsHovered(false)}
        >
          {text}
        </motion.span>
      </div>
    );
  }
);

AnimatedText.displayName = "AnimatedText";

const MovieHero = ({
  movie,
  locale = "en"
}: {
  movie: Movie;
  locale?: "en" | "he";
}) => {
  const [showTrailer, setShowTrailer] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getPosterPath = (movie: Movie, locale: string) => {
    if (locale === 'he' && movie.poster_path_he) {
      return movie.poster_path_he;
    }
    return movie.poster_path_en;
  };

  const getTitle = (movie: Movie, locale: string) => {
    if (locale === 'he' && movie.title_he) {
      return movie.title_he;
    }
    return movie.title;
  };

  const getOverview = (movie: Movie, locale: string) => {
    if (locale === 'he' && movie.overview_he) {
      return movie.overview_he;
    }
    return movie.overview;
  };

  return (
    <>
      <div className="relative min-h-screen w-full overflow-hidden bg-black">
        {/* Backdrop with parallax and blur */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${movie.backdrop_path})`,
            filter: 'blur(2px)',
            transform: `scale(1.05) translateY(${scrollY * 0.5}px)`
          }}
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />

        {/* Content */}
        <div className="relative z-10 flex items-center min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Poster */}
              <motion.div
                initial={{ opacity: 0, x: locale === 'he' ? 50 : -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className={cn(
                  "flex justify-center lg:justify-start order-1",
                  locale === 'he' && "lg:order-2"
                )}
              >
                <div className="relative group">
                  <motion.img
                    src={getPosterPath(movie, locale)}
                    alt={getTitle(movie, locale)}
                    className="w-48 sm:w-56 md:w-72 lg:w-80 h-auto rounded-2xl shadow-2xl"
                    style={{
                      transform: `translateY(${scrollY * -0.2}px)`
                    }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl" />
                </div>
              </motion.div>

              {/* Movie Info */}
              <motion.div
                initial={{ opacity: 0, x: locale === 'he' ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className={cn(
                  "text-white space-y-4 sm:space-y-6 text-center lg:text-left order-2",
                  locale === 'he' && "lg:order-1 lg:text-right"
                )}
              >
                <div className="space-y-3 sm:space-y-4">
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight"
                  >
                    {getTitle(movie, locale)}
                  </motion.h1>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className={cn(
                      "flex flex-wrap gap-2 sm:gap-3 items-center justify-center lg:justify-start",
                      locale === 'he' && "lg:justify-end"
                    )}
                  >
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs sm:text-sm px-2 py-1">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      {movie.vote_average.toFixed(1)}
                    </Badge>
                    <Badge variant="outline" className="border-white/30 text-white text-xs sm:text-sm px-2 py-1">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      {movie.runtime} min
                    </Badge>
                    <Badge variant="outline" className="border-white/30 text-white text-xs sm:text-sm px-2 py-1">
                      {new Date(movie.release_date).getFullYear()}
                    </Badge>
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.0 }}
                    className="text-sm sm:text-base md:text-lg text-gray-300 leading-relaxed max-w-2xl mx-auto lg:mx-0"
                  >
                    {getOverview(movie, locale)}
                  </motion.p>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                  className={cn(
                    "flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start",
                    locale === 'he' && "lg:justify-end"
                  )}
                >
                  <Button
                    onClick={() => setShowTrailer(true)}
                    size="lg"
                    className="bg-white text-black hover:bg-gray-200 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold w-full sm:w-auto min-h-[48px]"
                  >
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    {locale === 'he' ? 'צפה בטריילר' : 'Watch Trailer'}
                  </Button>
                  <Button
                    size="lg"
                    className="bg-blue-600 text-white hover:bg-blue-700 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold w-full sm:w-auto min-h-[48px]"
                  >
                    <Ticket className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    {locale === 'he' ? 'הזמן כרטיס' : 'Book Ticket'}
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 hidden sm:block"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-white/30 rounded-full flex justify-center"
          >
            <div className="w-1 h-2 sm:h-3 bg-white/50 rounded-full mt-2" />
          </motion.div>
        </motion.div>
      </div>

      <TrailerModal
        isOpen={showTrailer}
        onClose={() => setShowTrailer(false)}
        src={movie.trailer_url || ""}
      />
    </>
  );
};

const FloatingDatePicker = ({
  dates,
  selectedDate,
  onDateSelect,
  locale = "en"
}: {
  dates: Date[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  locale?: "en" | "he";
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const formatDate = (date: Date, locale: string) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    };

    if (locale === 'he') {
      return date.toLocaleDateString('he-IL', options);
    }
    return date.toLocaleDateString('en-US', options);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-hide px-1"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {dates.map((date, index) => (
          <motion.button
            key={index}
            onClick={() => onDateSelect(date)}
            className={cn(
              "flex-shrink-0 p-3 md:p-4 rounded-xl border-2 transition-all duration-200",
              "min-w-[80px] md:min-w-[100px] text-center min-h-[80px] md:min-h-[90px]",
              selectedDate.toDateString() === date.toDateString()
                ? "bg-white text-black border-white"
                : "bg-white/10 text-white border-white/20 hover:bg-white/20",
              isToday(date) && "ring-2 ring-blue-400"
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ scrollSnapAlign: 'start' }}
          >
            <div className="text-xs md:text-sm font-medium">
              {formatDate(date, locale).split(' ')[0]}
            </div>
            <div className="text-base md:text-lg font-bold">
              {date.getDate()}
            </div>
            <div className="text-xs opacity-70">
              {formatDate(date, locale).split(' ')[2]}
            </div>
            {isToday(date) && (
              <div className="text-xs text-blue-400 font-semibold mt-1">
                {locale === 'he' ? 'היום' : 'Today'}
              </div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

const GlassCardShowtime = ({
  theater,
  onShowtimeSelect,
  locale = "en"
}: {
  theater: Theater;
  onShowtimeSelect: (theater: Theater, time: string) => void;
  locale?: "en" | "he";
}) => {
  const getTheaterName = (theater: Theater, locale: string) => {
    if (locale === 'he' && theater.name_he) {
      return theater.name_he;
    }
    return theater.name;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 md:p-6 hover:bg-white/10 transition-all duration-300"
    >
      <div className={cn(
        "flex items-center gap-3 md:gap-4 mb-3 md:mb-4",
        locale === 'he' && "flex-row-reverse"
      )}>
        <div className="text-2xl md:text-3xl">{theater.logo}</div>
        <div className={cn("flex-1", locale === 'he' && "text-right")}>
          <h3 className="text-white font-semibold text-base md:text-lg">
            {getTheaterName(theater, locale)}
          </h3>
          <div className={cn(
            "flex items-center gap-2 text-gray-400 text-xs md:text-sm",
            locale === 'he' && "flex-row-reverse"
          )}>
            <MapPin className="w-3 h-3 md:w-4 md:h-4" />
            <span>{theater.distance} km</span>
          </div>
        </div>
      </div>

      {/* Availability bar */}
      <div className="mb-3 md:mb-4">
        <div className={cn(
          "flex justify-between items-center mb-2",
          locale === 'he' && "flex-row-reverse"
        )}>
          <span className="text-gray-400 text-xs md:text-sm">
            {locale === 'he' ? 'זמינות מקומות' : 'Seat Availability'}
          </span>
          <span className="text-white text-xs md:text-sm font-medium">
            {theater.availability}%
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-1.5 md:h-2">
          <motion.div
            className={cn(
              "h-1.5 md:h-2 rounded-full",
              theater.availability > 80 ? "bg-green-500" :
                theater.availability > 50 ? "bg-yellow-500" : "bg-red-500"
            )}
            initial={{ width: 0 }}
            animate={{ width: `${theater.availability}%` }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
      </div>

      {/* Showtimes */}
      <div className="grid grid-cols-2 gap-2">
        {theater.showtimes.map((time, index) => (
          <motion.button
            key={index}
            onClick={() => onShowtimeSelect(theater, time)}
            className="bg-white/10 hover:bg-white/20 text-white py-2.5 md:py-2 px-3 md:px-4 rounded-lg transition-all duration-200 font-medium text-sm md:text-base min-h-[44px] md:min-h-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {time}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

interface CarouselProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemWidthClass: string;
  gapClass: string;
  title: string;
  description: string;
  locale: "en" | "he";
  icon: React.ElementType;
  className?: string;
}

const Carousel = <T extends { id: number }>({
  items,
  renderItem,
  itemWidthClass,
  gapClass,
  title,
  description,
  locale,
  icon: Icon,
  className
}: CarouselProps<T>) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollWidth, clientWidth, scrollLeft } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1); // -1 for floating point precision
    }
  }, []);

  useEffect(() => {
    checkScroll();
    const currentRef = scrollRef.current;
    currentRef?.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);
    return () => {
      currentRef?.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll, items]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8; // Scroll 80% of container width
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className={cn("relative py-8 sm:py-12 lg:py-16 z-10", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn("mb-6 sm:mb-8 lg:mb-12", locale === 'he' && "text-right")}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 lg:mb-4 flex items-center gap-2 sm:gap-3">
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
            {title}
          </h2>
          <p className="text-gray-400 text-sm sm:text-base lg:text-lg">
            {description}
          </p>
        </motion.div>

        <div className="relative">
          <div
            ref={scrollRef}
            className={cn(
              "flex overflow-x-auto scrollbar-hide snap-x snap-mandatory",
              gapClass
            )}
          >
            {items.map((item, index) => (
              <div key={item.id} className={cn("flex-shrink-0 snap-start", itemWidthClass)}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {renderItem(item, index)}
                </motion.div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows for larger screens */}
          <AnimatePresence>
            {canScrollLeft && (
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onClick={() => scroll('left')}
                className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full z-10 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </motion.button>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {canScrollRight && (
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onClick={() => scroll('right')}
                className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full z-10 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};


const VideosSection = ({
  videos,
  locale = "en"
}: {
  videos: Video[];
  locale?: "en" | "he";
}) => {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const getVideoName = (video: Video, locale: string) => {
    if (locale === 'he' && video.name_he) {
      return video.name_he;
    }
    return video.name;
  };

  const renderVideoItem = useCallback((video: Video) => (
    <div
      className="group cursor-pointer"
      onClick={() => setSelectedVideo(video)}
    >
      <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-300">
        <div className="relative aspect-video">
          <img
            src={video.thumbnail}
            alt={getVideoName(video, locale)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300" />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white ml-0.5 sm:ml-1" />
            </motion.div>
          </div>
          <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-white text-xs sm:text-sm">
            {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
          </div>
        </div>
        <div className="p-3 sm:p-4">
          <h3 className="text-white font-semibold text-sm sm:text-base lg:text-lg mb-1">
            {getVideoName(video, locale)}
          </h3>
          <p className="text-gray-400 text-xs sm:text-sm">
            {video.type}
          </p>
        </div>
      </div>
    </div>
  ), [locale]);

  return (
    <>
      <Carousel
        items={videos}
        renderItem={renderVideoItem}
        itemWidthClass="w-[80vw] sm:w-1/2 lg:w-1/3"
        gapClass="gap-4 sm:gap-6"
        title={locale === 'he' ? 'סרטונים וטריילרים' : 'Videos & Trailers'}
        description={locale === 'he' ? 'צפו בטריילרים ובקטעים מהסרט' : 'Watch trailers and exclusive clips'}
        locale={locale}
        icon={Film}
      />

      {selectedVideo && (
        <TrailerModal
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
          src={`https://videos.pexels.com/video-files/${selectedVideo.key}/13003128_2560_1440_25fps.mp4`}
        />
      )}
    </>
  );
};

const CastSection = ({
  cast,
  locale = "en"
}: {
  cast: CastMember[];
  locale?: "en" | "he";
}) => {
  const getCastName = (member: CastMember, locale: string) => {
    if (locale === 'he' && member.name_he) {
      return member.name_he;
    }
    return member.name;
  };

  const getCharacterName = (member: CastMember, locale: string) => {
    if (locale === 'he' && member.character_he) {
      return member.character_he;
    }
    return member.character;
  };

  const renderCastItem = useCallback((member: CastMember) => (
    <div className="group">
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3 sm:p-4 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
        <div className="relative mb-3 sm:mb-4">
          <img
            src={member.profile_path}
            alt={getCastName(member, locale)}
            className="w-full aspect-square object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl" />
        </div>
        <div className={cn("text-center", locale === 'he' && "text-right")}>
          <h3 className="text-white font-semibold text-xs sm:text-sm mb-1 line-clamp-2">
            {getCastName(member, locale)}
          </h3>
          <p className="text-gray-400 text-xs line-clamp-2">
            {getCharacterName(member, locale)}
          </p>
        </div>
      </div>
    </div>
  ), [locale]);

  return (
    <Carousel
      items={cast}
      renderItem={renderCastItem}
      itemWidthClass="w-[45vw] sm:w-1/3 md:w-1/4 lg:w-1/6"
      gapClass="gap-3 sm:gap-4 lg:gap-6"
      title={locale === 'he' ? 'שחקנים' : 'Cast'}
      description={locale === 'he' ? 'הכירו את השחקנים והדמויות' : 'Meet the talented cast and characters'}
      locale={locale}
      icon={User}
    />
  );
};

const KeywordsSection = ({
  keywords,
  locale = "en"
}: {
  keywords: Keyword[];
  locale?: "en" | "he";
}) => {
  const getKeywordName = (keyword: Keyword, locale: string) => {
    if (locale === 'he' && keyword.name_he) {
      return keyword.name_he;
    }
    return keyword.name;
  };

  return (
    <div className="relative py-8 sm:py-12 lg:py-16 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn("mb-6 sm:mb-8 lg:mb-12", locale === 'he' && "text-right")}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 lg:mb-4">
            {locale === 'he' ? 'מילות מפתח' : 'Keywords'}
          </h2>
          <p className="text-gray-400 text-sm sm:text-base lg:text-lg">
            {locale === 'he' ? 'נושאים ותגיות הקשורים לסרט' : 'Topics and themes related to this movie'}
          </p>
        </motion.div>

        <div className="flex flex-wrap gap-2 sm:gap-3">
          {keywords.map((keyword, index) => (
            <motion.div
              key={keyword.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 sm:px-4 lg:px-6 py-2 sm:py-3 hover:bg-white/20 hover:border-white/30 transition-all duration-300 cursor-pointer group min-h-[44px] flex items-center"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-white font-medium group-hover:text-gray-200 transition-colors text-sm sm:text-base">
                {getKeywordName(keyword, locale)}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const RelatedArticlesSection = ({
  articles,
  locale = "en"
}: {
  articles: Article[];
  locale?: "en" | "he";
}) => {
  const getArticleTitle = (article: Article, locale: string) => {
    if (locale === 'he' && article.title_he) {
      return article.title_he;
    }
    return article.title;
  };

  const getArticleExcerpt = (article: Article, locale: string) => {
    if (locale === 'he' && article.excerpt_he) {
      return article.excerpt_he;
    }
    return article.excerpt;
  };

  const getAuthorName = (article: Article, locale: string) => {
    if (locale === 'he' && article.author_he) {
      return article.author_he;
    }
    return article.author;
  };

  const getCategoryName = (article: Article, locale: string) => {
    if (locale === 'he' && article.category_he) {
      return article.category_he;
    }
    return article.category;
  };

  const renderArticleItem = useCallback((article: Article) => (
    <article className="group cursor-pointer">
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all duration-300">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={article.image}
            alt={getArticleTitle(article, locale)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-2 sm:top-3 lg:top-4 left-2 sm:left-3 lg:left-4">
            <Badge className="bg-blue-600/80 backdrop-blur-sm text-white border-0 text-xs sm:text-sm">
              {getCategoryName(article, locale)}
            </Badge>
          </div>
        </div>
        <div className="p-3 sm:p-4 lg:p-6">
          <h3 className="text-white font-bold text-base sm:text-lg lg:text-xl mb-2 sm:mb-3 line-clamp-2 group-hover:text-gray-300 transition-colors">
            {getArticleTitle(article, locale)}
          </h3>
          <p className="text-gray-400 text-sm sm:text-base mb-3 sm:mb-4 line-clamp-3">
            {getArticleExcerpt(article, locale)}
          </p>
          <div className={cn(
            "flex items-center justify-between text-xs sm:text-sm text-gray-500 gap-2",
            locale === 'he' && "flex-row-reverse"
          )}>
            <span className="truncate flex-1 min-w-0">{getAuthorName(article, locale)}</span>
            <div className={cn(
              "flex items-center gap-1 sm:gap-2 flex-shrink-0",
              locale === 'he' && "flex-row-reverse"
            )}>
              <span className="whitespace-nowrap">{new Date(article.date).toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-US')}</span>
              <span>•</span>
              <span className="whitespace-nowrap">{article.readTime} {locale === 'he' ? 'דק' : 'min'}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  ), [locale]);

  return (
    <Carousel
      items={articles}
      renderItem={renderArticleItem}
      itemWidthClass="w-[80vw] sm:w-1/2 lg:w-1/3"
      gapClass="gap-4 sm:gap-6 lg:gap-8"
      title={locale === 'he' ? 'מאמרים קשורים' : 'Related Articles'}
      description={locale === 'he' ? 'קראו עוד על הסרט והעולם שלו' : 'Read more about the movie and its world'}
      locale={locale}
      icon={Film} // Using Film icon as a placeholder, consider a more appropriate icon if available
    />
  );
};

const ReviewsSection = ({
  reviews,
  locale = "en"
}: {
  reviews: Review[];
  locale?: "en" | "he";
}) => {
  const getAuthorName = (review: Review, locale: string) => {
    if (locale === 'he' && review.author_he) {
      return review.author_he;
    }
    return review.author;
  };

  const getReviewContent = (review: Review, locale: string) => {
    if (locale === 'he' && review.content_he) {
      return review.content_he;
    }
    return review.content;
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
          </div>
        </div>
      );
    }

    const remainingStars = 10 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
      );
    }

    return stars;
  };

  const renderReviewItem = useCallback((review: Review) => (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
      <div className={cn(
        "flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4",
        locale === 'he' && "flex-row-reverse"
      )}>
        <img
          src={review.avatar}
          alt={getAuthorName(review, locale)}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
        />
        <div className={cn("flex-1 min-w-0", locale === 'he' && "text-right")}>
          <div className={cn(
            "flex items-center gap-2 mb-1 flex-wrap",
            locale === 'he' && "flex-row-reverse"
          )}>
            <h4 className="text-white font-semibold text-sm sm:text-base truncate">
              {getAuthorName(review, locale)}
            </h4>
            {review.verified && (
              <Badge className="bg-green-600/20 text-green-400 border-green-600/30 text-xs flex-shrink-0">
                {locale === 'he' ? 'מאומת' : 'Verified'}
              </Badge>
            )}
          </div>
          <div className={cn(
            "flex items-center gap-2 mb-2 flex-wrap",
            locale === 'he' && "flex-row-reverse"
          )}>
            <div className="flex gap-1">
              {renderStars(review.rating)}
            </div>
            <span className="text-white font-medium text-xs sm:text-sm">
              {review.rating}/10
            </span>
          </div>
          <p className="text-gray-400 text-xs sm:text-sm">
            {new Date(review.date).toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-US')}
          </p>
        </div>
      </div>

      <p className="text-gray-300 leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base">
        {getReviewContent(review, locale)}
      </p>

      <div className={cn(
        "flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 flex-wrap",
        locale === 'he' && "flex-row-reverse"
      )}>
        <button className="hover:text-gray-300 transition-colors min-h-[44px] sm:min-h-auto flex items-center px-2 py-2 sm:p-0">
          👍 {review.helpful} {locale === 'he' ? 'מועיל' : 'Helpful'}
        </button>
        <button className="hover:text-gray-300 transition-colors min-h-[44px] sm:min-h-auto flex items-center px-2 py-2 sm:p-0">
          {locale === 'he' ? 'השב' : 'Reply'}
        </button>
      </div>
    </div>
  ), [locale]);

  return (
    <div className="relative py-8 sm:py-12 lg:py-16 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn("mb-6 sm:mb-8 lg:mb-12", locale === 'he' && "text-right")}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 lg:mb-4">
            {locale === 'he' ? 'ביקורות' : 'Reviews'}
          </h2>
          <p className="text-gray-400 text-sm sm:text-base lg:text-lg">
            {locale === 'he' ? 'מה אומרים הצופים על הסרט' : 'What viewers are saying about the movie'}
          </p>
        </motion.div>

        <Carousel
          items={reviews}
          renderItem={renderReviewItem}
          itemWidthClass="w-[90vw] sm:w-1/2 lg:w-1/2"
          gapClass="gap-4 sm:gap-6"
          title="" // Title and description are handled by the parent ReviewsSection
          description=""
          locale={locale}
          icon={Users}
          className="!py-0" // Override padding from Carousel
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-6 sm:mt-8 lg:mt-12"
        >
          <Button
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base min-h-[48px]"
          >
            {locale === 'he' ? 'טען עוד ביקורות' : 'Load More Reviews'}
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

const RecommendedSection = ({
  movies,
  locale = "en"
}: {
  movies: RecommendedMovie[];
  locale?: "en" | "he";
}) => {
  const getMovieTitle = (movie: RecommendedMovie, locale: string) => {
    if (locale === 'he' && movie.title_he) {
      return movie.title_he;
    }
    return movie.title;
  };

  const renderMovieItem = useCallback((movie: RecommendedMovie) => (
    <div className="group cursor-pointer">
      <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-300">
        <div className="relative aspect-[2/3]">
          <img
            src={movie.poster_path}
            alt={getMovieTitle(movie, locale)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-2 sm:bottom-3 lg:bottom-4 left-2 sm:left-3 lg:left-4 right-2 sm:right-3 lg:right-4 transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
              <span className="text-white text-xs sm:text-sm font-medium">
                {movie.vote_average.toFixed(1)}
              </span>
            </div>
            <p className="text-white text-xs sm:text-sm">
              {movie.genre} • {new Date(movie.release_date).getFullYear()}
            </p>
          </div>
        </div>
        <div className="p-2 sm:p-3 lg:p-4">
          <h3 className="text-white font-semibold text-xs sm:text-sm line-clamp-2 group-hover:text-gray-300 transition-colors">
            {getMovieTitle(movie, locale)}
          </h3>
        </div>
      </div>
    </div>
  ), [locale]);

  return (
    <Carousel
      items={movies}
      renderItem={renderMovieItem}
      itemWidthClass="w-[45vw] sm:w-1/3 md:w-1/4 lg:w-1/5"
      gapClass="gap-3 sm:gap-4 lg:gap-6"
      title={locale === 'he' ? 'סרטים מומלצים' : 'Recommended Movies'}
      description={locale === 'he' ? 'סרטים נוספים שעשויים לעניין אותך' : 'More movies you might enjoy'}
      locale={locale}
      icon={Star}
    />
  );
};

const ShowtimeTitle = ({ locale }: { locale: "en" | "he" }) => {
  return (
    <AnimatedText
      text={locale === 'he' ? 'הזמן כרטיסים' : 'Book Tickets'}
      gradientColors="linear-gradient(90deg, #00F, #FFF, #00F)"
      gradientAnimationDuration={2}
      hoverEffect={true}
      textClassName="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold"
      className={cn("mb-2 sm:mb-3 lg:mb-4", locale === 'he' && "text-right")}
    />
  );
};

const ShowtimesSection = ({
  showtimes,
  locale = "en"
}: {
  showtimes: ShowtimeData;
  locale?: "en" | "he";
}) => {
  const [selectedDate, setSelectedDate] = useState(showtimes.dates[0]);
  const [selectedLocation, setSelectedLocation] = useState("Tel Aviv");

  const handleShowtimeSelect = (theater: Theater, time: string) => {
    console.log(`Selected: ${theater.name} at ${time}`);
    // Here you would typically redirect to the theater's booking page
  };

  const renderTheaterItem = useCallback((theater: Theater) => (
    <GlassCardShowtime
      theater={theater}
      onShowtimeSelect={handleShowtimeSelect}
      locale={locale}
    />
  ), [locale]);

  return (
    <div className="relative py-8 sm:py-12 lg:py-16 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn("text-center mb-6 sm:mb-8 lg:mb-12", locale === 'he' && "text-right")}
        >
          <ShowtimeTitle locale={locale} />
          <p className="text-gray-400 text-sm sm:text-base lg:text-lg">
            {locale === 'he' ? 'בחר תאריך ובית קולנוע' : 'Select date and cinema'}
          </p>
        </motion.div>

        {/* Date Picker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 sm:mb-8"
        >
          <h3 className={cn(
            "text-white text-base sm:text-lg lg:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2",
            locale === 'he' && "flex-row-reverse"
          )}>
            <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            {locale === 'he' ? 'בחר תאריך' : 'Select Date'}
          </h3>
          <FloatingDatePicker
            dates={showtimes.dates}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            locale={locale}
          />
        </motion.div>

        {/* Location Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6 sm:mb-8"
        >
          <h3 className={cn(
            "text-white text-base sm:text-lg lg:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2",
            locale === 'he' && "flex-row-reverse"
          )}>
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
            {locale === 'he' ? 'אזור' : 'Location'}
          </h3>
          <div className="flex gap-2 sm:gap-3 flex-wrap">
            {['Tel Aviv', 'Jerusalem', 'Haifa'].map((location) => (
              <Button
                key={location}
                variant={selectedLocation === location ? "default" : "outline"}
                onClick={() => setSelectedLocation(location)}
                className={cn(
                  "text-sm sm:text-base px-3 sm:px-4 lg:px-6 py-2 sm:py-3 min-h-[44px]",
                  selectedLocation === location
                    ? "bg-white text-black"
                    : "border-white/30 text-white hover:bg-white/10"
                )}
              >
                {location}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Theaters Grid / Carousel for mobile */}
        <div className="hidden sm:grid gap-4 sm:gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {showtimes.theaters.map((theater, index) => (
            <motion.div
              key={theater.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
            >
              <GlassCardShowtime
                theater={theater}
                onShowtimeSelect={handleShowtimeSelect}
                locale={locale}
              />
            </motion.div>
          ))}
        </div>
        <div className="sm:hidden">
          <Carousel
            items={showtimes.theaters}
            renderItem={renderTheaterItem}
            itemWidthClass="w-[90vw]"
            gapClass="gap-4"
            title="" // Title and description are handled by the parent ShowtimesSection
            description=""
            locale={locale}
            icon={MapPin} // Placeholder, not displayed due to empty title
            className="!py-0" // Override padding from Carousel
          />
        </div>
      </div>
    </div>
  );
};

const MovieAffiliateWebsite = ({
  movie = defaultMovie,
  showtimes = defaultShowtimes,
  locale = "en"
}: {
  movie?: Movie;
  showtimes?: ShowtimeData;
  locale?: "en" | "he";
}) => {
  return (
    <div className={cn("min-h-screen bg-black relative", locale === 'he' && "rtl")}>
      {/* Global Backdrop */}
      <div
        className="fixed inset-0 w-full h-full bg-cover bg-center z-0"
        style={{
          backgroundImage: `url(${movie.backdrop_path})`,
          filter: 'blur(10px) brightness(0.5)',
          transform: 'scale(1.1)',
        }}
      />
      <div className="fixed inset-0 bg-black/70 z-0" />

      {/* Header removed as per request */}
      <MovieHero movie={movie} locale={locale} />
      <ShowtimesSection showtimes={showtimes} locale={locale} />
      {movie.videos && <VideosSection videos={movie.videos} locale={locale} />}
      {movie.cast && <CastSection cast={movie.cast} locale={locale} />}
      <ReviewsSection reviews={movieReviews} locale={locale} />
      <RelatedArticlesSection articles={relatedArticles} locale={locale} />
      <RecommendedSection movies={recommendedMovies} locale={locale} />
      {movie.keywords && <KeywordsSection keywords={movie.keywords} locale={locale} />}
    </div>
  );
};

export default MovieAffiliateWebsite;