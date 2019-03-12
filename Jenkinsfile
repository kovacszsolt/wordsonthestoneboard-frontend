node {
    def DOCKERREPOSITORYNAME = "kovacszsolt/wordsonthestoneboard-frontend"
    def DOCKERCREDENTIAL = "dockerhub"
    def now = new Date()
    stage("Clone") {
        git credentialsId: "github-kovacszsolt", url: "https://github.com/kovacszsolt/wordsonthestoneboard-frontend"
        writeFile file: "src/assets/version.json", text: "{\"version\":\"${BUILD_NUMBER}\",\"createdate\":\"${now.format("MM-dd-YYYY HH:mm", TimeZone.getTimeZone("UTC"))}\" }"
    }
    stage("Build JS") {
        sh "docker run --rm -w /home/node/app/ -v \"${WORKSPACE}\":/home/node/app/ kovacszsolt/angular7:latest sh -c \"npm install; npm run build\""
    }
    stage("Generate Image") {
        dockerImage = docker.build "${DOCKERREPOSITORYNAME}"
        dockerImage.tag("latest")
        dockerImage.tag("${currentBuild.number}")
        dockerImage.push("latest")
        dockerImage.push("${currentBuild.number}")
    }
    stage("Deploy") {
        sh "ssh docker@itcrowd.hu './wordsonthestoneboard.sh'"
    }
    stage("Clear") {
        cleanWs()
    }
}
