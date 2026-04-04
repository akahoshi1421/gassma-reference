import type { ReactNode } from "react";
import clsx from "clsx";
import Heading from "@theme/Heading";
import Translate from "@docusaurus/Translate";
import styles from "./styles.module.css";

type FeatureItem = {
  title: ReactNode;
  Svg: React.ComponentType<React.ComponentProps<"svg">>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: (
      <Translate id="homepage.feature1.title">より管理しやすく</Translate>
    ),
    Svg: require("@site/static/img/GoogleAppsScript.svg").default,
    description: (
      <Translate id="homepage.feature1.description">
        スプレッドシートのここの行を取得したり、取得したものを条件付きでソートを行ったり...と言ったことをしたい場合、複雑な配列処理を行わないといけません。するとコードが膨大化し、可読性が低下します。GASsmaはこれらの問題を解決し、コード量を抑えます。
      </Translate>
    ),
  },
  {
    title: (
      <Translate id="homepage.feature2.title">よりミスを減らす</Translate>
    ),
    Svg: require("@site/static/img/GoogleSheets.svg").default,
    description: (
      <Translate id="homepage.feature2.description">
        スプレッドシートをGASで扱う際、getRange()を利用して行番号や列番号を指定します。これは数え間違えのリスクが発生します。しかし、GASsmaは列名やシートの範囲も自動で読んでくれます。あなたはシートの範囲を数える必要がありません。
      </Translate>
    ),
  },
  {
    title: (
      <Translate id="homepage.feature3.title">より安全に</Translate>
    ),
    Svg: require("@site/static/img/shield.svg").default,
    description: (
      <Translate id="homepage.feature3.description">
        スプレッドシートをGASで扱う際、ある程度セキュリティを意識しないといけません。例えばGoogleForm等と連携した場合、悪意のあるユーザがスプレッドシート関数を回答に入力したとしても、実行できないようにしなければなりません。GASsmaはこのようなセキュリティ対策もしており、安全な開発が可能です。
      </Translate>
    ),
  },
];

function Feature({ title, Svg, description }: FeatureItem) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
