# heroku自分用メモ

- expressなどのパッケージは```dependencies```に書くことでherokuにdeployするときにインストールしてくれる（```devDependencies```ではない）
- addonを入れるにはクレカ登録必須（無料プランでも）
- mLab mongodbの初期passwordは```heroku config```の```MONGODB_URI```でわかる