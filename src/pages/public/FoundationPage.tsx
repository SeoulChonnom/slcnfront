import { DesktopHeader } from '../../components/layout/DesktopHeader';
import { Footer } from '../../components/layout/Footer';
import { MobileBottomNav } from '../../components/layout/MobileBottomNav';
import { Button, LinkButton } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PageSectionHeader } from '../../components/ui/PageSectionHeader';
import { SLCNLogoBlob } from '../../components/ui/SLCNLogoBlob';
import { TextField } from '../../components/ui/TextField';
import { cn } from '../../lib/utils/cn';

const cardClassName = cn('slcn-foundation-page__main');

export function FoundationPage() {
  return (
    <div className="slcn-foundation-page pink-mesh">
      <DesktopHeader className="hidden md:block" />
      <main className={cardClassName}>
        <section className="slcn-foundation-page__grid">
          <Card className="slcn-foundation-page__hero-card">
            <div className="slcn-foundation-page__logo-wrap">
              <SLCNLogoBlob size="lg" className="h-14 w-14 text-[0.72rem]" />
              <p className="slcn-foundation-page__kicker">step 03 refined</p>
            </div>
            <PageSectionHeader
              className="mt-6"
              title="SEOUL CHONNOM"
              description="Pencil 시안과 더 가깝게 맞춘 공통 컴포넌트 미리보기입니다."
            />
            <div className="slcn-foundation-page__field-grid">
              <TextField
                label="아이디를 입력하세요"
                placeholder="아이디를 입력하세요"
              />
              <TextField
                label="PASSWORD"
                type="password"
                placeholder="비밀번호를 입력하세요"
              />
            </div>
            <div className="slcn-foundation-page__button-grid">
              <Button fullWidth>↳ LOGIN</Button>
              <div className="slcn-foundation-page__button-row">
                <Button variant="secondary">취소</Button>
                <LinkButton to="/mobile/map">나들이로 이동</LinkButton>
              </div>
            </div>
          </Card>

          <div className="slcn-foundation-page__stack">
            <Card className="slcn-foundation-page__dark-card">
              <p className="slcn-foundation-page__dark-title display-hand">
                나들이 기록
              </p>
              <p className="slcn-foundation-page__dark-copy">
                Black card + pink canvas 대비를 유지하면서, 실제 시안처럼 더
                평면적인 덩어리감으로 정리했습니다.
              </p>
            </Card>

            <Card className="slcn-foundation-page__notes-card">
              <p className="slcn-foundation-page__notes-title display-hand">
                Design Notes
              </p>
              <ul className="slcn-foundation-page__notes-list">
                <li>
                  1. Header와 BottomNav는 떠 있는 카드가 아니라 strip
                  구조입니다.
                </li>
                <li>
                  2. Primary 버튼은 black fill + pink text 조합으로
                  고정했습니다.
                </li>
                <li>
                  3. Input은 큰 radius/shadow 대신 48px 필드와 2px border를
                  씁니다.
                </li>
              </ul>
            </Card>

            <Card className="slcn-foundation-page__mobile-card">
              <p className="slcn-foundation-page__mobile-title display-hand">
                Mobile Preview
              </p>
              <p className="slcn-foundation-page__mobile-copy">
                하단 네비는 5개 항목, flat pink bar, active/inactive 대비
                중심으로 맞췄습니다.
              </p>
            </Card>
          </div>
        </section>
      </main>
      <Footer className="hidden md:block" />
      <MobileBottomNav className="md:hidden" />
    </div>
  );
}
