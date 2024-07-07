pipeline {
    agent any
    
 
  
    // environment {
    //     key = credentials('ssh-aws').privateKey
    // }
    stages {
        
             stage('Add Host Key to known_hosts') {
            steps {
                script {
                    // Ensure the use of Bash and add the host key to known_hosts
                    sh """
                        #!/bin/bash
                        touch ~/.ssh/known_hosts
                        ssh-keyscan -H 44.202.22.202 >> ~/.ssh/known_hosts
                    """
                }
            }
        }
        
        stage('Hello') {
               
            steps {
                  
                script {
                  def remote = [:]
                  remote.name = 'root'
                  remote.host = '44.202.22.202'
                  remote.user = 'root'
             
                  echo "hello"
                  "ssh-keyscan -H 44.202.22.202 >> ~/.ssh/known_hosts"
                  "echo output"
                  "cat ~/.ssh/known_hosts"
                //   echo "SSH Username: ${sshCreds.privateKey}"
                //   echo "SSH Private Key: ${sshCreds}"
                  withCredentials([sshUserPrivateKey(credentialsId: 'ssh', keyFileVariable: 'MY_SSH_KEY')]) {

                    sh '''
                   
                    echo $MY_SSH_KEY
                    ssh -i $MY_SSH_KEY ec2-user@44.202.22.202 "ls -al"
                    '''
                } 
                }
               
            }
        }
    }
}
