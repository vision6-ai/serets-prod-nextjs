import { Metadata } from 'next'
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server'
import { Locale } from '@/config/i18n'
import { ContactForm } from '@/components/contact-form'

import { Card, CardContent } from '@/components/ui/card'
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Twitter } from 'lucide-react'

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: Locale }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'contact' })
  
  return {
    title: `${t('title')} | MovieTime`,
    description: t('subtitle'),
  }
}

export default async function ContactPage({ params: { locale } }: { params: { locale: Locale } }) {
  unstable_setRequestLocale(locale)
  const t = await getTranslations('contact')
  const isRtl = locale === 'he'
  
  return (
    <main className="container mx-auto px-4 py-12 md:py-24">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t('subtitle')}</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <ContactForm locale={locale} />
              </CardContent>
            </Card>
          </div>
          
          {/* Contact Info */}
          <div className="space-y-6">
            {/* Office Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">{t('officeSectionTitle')}</h3>
                <ul className={`space-y-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                  <li className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse justify-end' : ''}`}>
                    <MapPin className="h-5 w-5 text-primary" />
                    <span>{t('officeAddress')}</span>
                  </li>
                  <li className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse justify-end' : ''}`}>
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t('phoneLabel')}</p>
                      <p>{t('phoneNumber')}</p>
                    </div>
                  </li>
                  <li className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse justify-end' : ''}`}>
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t('emailContactLabel')}</p>
                      <p>{t('emailContact')}</p>
                    </div>
                  </li>
                  <li className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse justify-end' : ''}`}>
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t('hoursLabel')}</p>
                      <p>{t('hours')}</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            {/* Social Media */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">{t('socialTitle')}</h3>
                <div className={`flex gap-4 ${isRtl ? 'justify-end' : 'justify-start'}`}>
                  <a 
                    href="https://www.instagram.com/movietime_il?igsh=M3I2a2JpZnNvamcz" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 bg-primary/10 rounded-full hover:bg-primary/20 transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a 
                    href="https://facebook.com/serets.il" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 bg-primary/10 rounded-full hover:bg-primary/20 transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a 
                    href="https://twitter.com/serets_il" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 bg-primary/10 rounded-full hover:bg-primary/20 transition-colors"
                    aria-label="Twitter"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                </div>
              </CardContent>
            </Card>
            
            {/* Map */}
            <Card>
              <CardContent className="p-0 overflow-hidden rounded-lg">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3380.8888258902254!2d34.779905!3d32.075604!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x151d4b82a6148a07%3A0x10f9d68f71c4010!2sTel%20Aviv-Yafo%2C%20Israel!5e0!3m2!1sen!2sus!4v1711447462975!5m2!1sen!2sus" 
                  width="100%" 
                  height="200" 
                  style={{ border: 0 }} 
                  allowFullScreen={false} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Office Location Map"
                ></iframe>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
} 