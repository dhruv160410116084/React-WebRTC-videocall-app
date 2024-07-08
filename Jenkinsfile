pipeline {
    agent any
    
 
    parameters {
        string(name: 'json', defaultValue: '{}', description: 'Webhook payload')
    }

    environment {
        INSTANCE_ID = "NULL"
        EVENT = "NULL"
    }

    stages {
        stage("Process the webhook"){
            steps {
                script {
                      def payload = readJSON text: params.json
                      echo "Received payload: ${payload}"
                }
            }
        }
        
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
                    ssh -i $MY_SSH_KEY ubuntu@44.202.22.202 "ls -al"
                    '''
                } 
                }
               
            }
        }

        stage('Connect to Instance') {
            steps {
                script {
                    // Use the AWS CLI to get the public IP address of the new instance
                    def instanceInfo = sh(script: "aws ec2 describe-instances --instance-ids i-0551a796c66ef4259 --query 'Reservations[0].Instances[0].PublicIpAddress' --output text", returnStdout: true).trim()
                    
                    echo "Instance IP: ${instanceInfo}"
                }
            }
        }
    }
}
