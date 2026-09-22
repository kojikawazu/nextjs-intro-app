import { ContactForm } from '@/components/organisms/ContactForm';
import { SectionHeading } from '@/components/molecules/SectionHeading';

/** `ContactSection` の props。 */
export interface ContactSectionProps {
    /** セクション見出し（`navbar_data.contact_name`） */
    title: string;
}

/**
 * お問い合わせセクション。見出しと説明文を置き、フォーム本体は `ContactForm` に委ねる。
 *
 * **organism が organism を含む形になる。** Atomic Design は階層の入れ子を禁じておらず、
 * `ContactSection` は「セクションという区画」、`ContactForm` は「フォームという機能単位」で
 * 関心が違う。セクション側はフォームの状態を一切知らない。
 *
 * 説明文と見出しはハードコードしている。GCS の `contact_data` は同等の文言を持つが、
 * 現在の UI では参照していない（`docs/05-data-specification.md` の ContactData の節）。
 */
export function ContactSection({ title }: ContactSectionProps) {
    return (
        <section id="contact" className="container section-padding">
            <SectionHeading title={title} />
            <p className="mb-8 text-xs text-mute">お気軽にお問い合わせください</p>

            <ContactForm />
        </section>
    );
}
