import { Suspense } from "react";
import { WelcomeForm } from "./welcome-form";

export default function WelcomePage() {
  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-20">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">닉네임으로 시작하기</h1>
        <p className="text-sm text-muted-foreground">
          비밀번호는 필요 없어요. 사용하실 닉네임을 입력해주세요. (실제
          로그인은 나중에 추가될 예정입니다)
        </p>
      </div>
      <Suspense>
        <WelcomeForm />
      </Suspense>
    </div>
  );
}
