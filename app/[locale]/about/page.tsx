import { Metadata } from 'next';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { Locale } from '@/config/i18n';
import { 
  Film, 
  Users, 
  Globe, 
  Ticket, 
  Tags, 
  Smartphone,
  Building,
  Lightbulb
} from 'lucide-react';

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: Locale }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'about' });
  
  return {
    title: `${t('title')} | MovieTime`,
    description: t('subtitle'),
  };
}

export default async function AboutPage({ params: { locale } }: { params: { locale: Locale } }) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations('about');
  const isRtl = locale === 'he';
  
  return (
    <div className="container mx-auto px-4 py-12 md:py-24">
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">{t('subtitle')}</p>
        </div>
        
        {/* Main Content */}
        <div className="mb-16">
          <div className="relative w-full h-[300px] md:h-[400px] rounded-lg overflow-hidden mb-12">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-background" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 md:w-32 md:h-32 bg-primary/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Film className="h-10 w-10 md:h-16 md:w-16 text-primary" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-8 text-center">
              <h2 className="text-3xl font-bold drop-shadow-md">{t('mission.title')}</h2>
              <p className="text-lg max-w-3xl mx-auto drop-shadow-md">{t('mission.subtitle')}</p>
            </div>
          </div>
          
          <div className="prose prose-lg dark:prose-invert max-w-full">
            <p className="text-xl leading-relaxed mb-6">{t('intro')}</p>
            <p className="text-lg leading-relaxed mb-10">{t('story')}</p>
            
            <h2 className="text-2xl font-bold mb-6">{t('features.title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className={`flex ${isRtl ? 'flex-row-reverse text-right' : 'flex-row text-left'} gap-4 items-start`}>
                <div className="bg-primary/10 p-3 rounded-full">
                  <Film className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{t('features.discover.title')}</h3>
                  <p className="text-muted-foreground">{t('features.discover.description')}</p>
                </div>
              </div>
              
              <div className={`flex ${isRtl ? 'flex-row-reverse text-right' : 'flex-row text-left'} gap-4 items-start`}>
                <div className="bg-primary/10 p-3 rounded-full">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{t('features.trailers.title')}</h3>
                  <p className="text-muted-foreground">{t('features.trailers.description')}</p>
                </div>
              </div>
              
              <div className={`flex ${isRtl ? 'flex-row-reverse text-right' : 'flex-row text-left'} gap-4 items-start`}>
                <div className="bg-primary/10 p-3 rounded-full">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{t('features.actors.title')}</h3>
                  <p className="text-muted-foreground">{t('features.actors.description')}</p>
                </div>
              </div>
              
              <div className={`flex ${isRtl ? 'flex-row-reverse text-right' : 'flex-row text-left'} gap-4 items-start`}>
                <div className="bg-primary/10 p-3 rounded-full">
                  <Ticket className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{t('features.tickets.title')}</h3>
                  <p className="text-muted-foreground">{t('features.tickets.description')}</p>
                </div>
              </div>
              
              <div className={`flex ${isRtl ? 'flex-row-reverse text-right' : 'flex-row text-left'} gap-4 items-start`}>
                <div className="bg-primary/10 p-3 rounded-full">
                  <Tags className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{t('features.discounts.title')}</h3>
                  <p className="text-muted-foreground">{t('features.discounts.description')}</p>
                </div>
              </div>
              
              <div className={`flex ${isRtl ? 'flex-row-reverse text-right' : 'flex-row text-left'} gap-4 items-start`}>
                <div className="bg-primary/10 p-3 rounded-full">
                  <Smartphone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{t('features.responsive.title')}</h3>
                  <p className="text-muted-foreground">{t('features.responsive.description')}</p>
                </div>
              </div>
            </div>
            
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">{t('partnerships.title')}</h2>
              <div className={`flex ${isRtl ? 'flex-row-reverse text-right' : 'flex-row text-left'} gap-4 items-start`}>
                <div className="bg-primary/10 p-3 rounded-full">
                  <Building className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-lg leading-relaxed">{t('partnerships.description')}</p>
                </div>
              </div>
            </div>
            
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">{t('vision.title')}</h2>
              <div className={`flex ${isRtl ? 'flex-row-reverse text-right' : 'flex-row text-left'} gap-4 items-start`}>
                <div className="bg-primary/10 p-3 rounded-full">
                  <Lightbulb className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-lg leading-relaxed">{t('vision.description')}</p>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-12 bg-primary/5 p-8 rounded-lg">
              <p className="text-xl italic">{t('conclusion')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 