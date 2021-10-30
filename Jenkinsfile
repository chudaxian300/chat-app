pipeline {
    agent any


    stages {
        stage('Build') {
            steps {
                sh 'npm install --unsafe69-perm'
            }
        }
        stage('Deploy') {
            steps {
                sh 'sh ./scripts/stop-app.sh'
                sh 'sh ./scripts/start-app.sh'
            }
        }
    }
}