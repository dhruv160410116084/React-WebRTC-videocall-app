
def autoCancelled = false

pipeline {
    agent any
    stages {
        stage('Process the webhook'){
            steps {
                script {
                   // Check if the parameter is received
                    echo "Raw SQS Body Parameter: ${params.sqs_body}"
                    
                    
                    // Validate and parse the JSON
                    def payload = readJSON text: params.sqs_body   
                     if (payload.Event == 'autoscaling:TEST_NOTIFICATION') {
                        echo 'Specific data received, finishing pipeline with success.'
                        currentBuild.result = 'SUCCESS'
                        autoCancelled = true
                        return  // Exit the pipeline
                    }
                    // payload = readJSON text: payload.Message
                    echo "Received payload: ${payload}"
                    env.INSTANCE_ID = payload.EC2InstanceId
                    env.EVENT = payload.LifecycleTransition
                    def instanceInfo = sh(script: "aws ec2 describe-instances --instance-ids ${env.INSTANCE_ID} --query 'Reservations[0].Instances[0].PublicIpAddress' --output text", returnStdout: true).trim()
                    
                   echo "Instance IP: ${instanceInfo}"
                   env.Instance_IP = instanceInfo
                
                }
            }
        }
        
        stage('Add Host Key to known_hosts') {
            steps {
                script {
                    try {
                         sleep time: 40, unit: 'SECONDS'
                        if (env.EVENT == 'autoscaling:EC2_INSTANCE_LAUNCHING') {
                            echo 'instance launched'
                            sh """
                            #!/bin/bash
                            touch ~/.ssh/known_hosts
                            ssh-keyscan -H ${env.Instance_IP} >> ~/.ssh/known_hosts
                        """
                        } else {
                            echo 'I execute elsewhere'
                        }
                        echo "${env.INSTANCE_ID}"
                   
                    // Ensure the use of Bash and add the host key to known_hosts
                    
                } catch(e){
                        echo "${e}"
                    }
            }
        }
        }

       
        
        stage('Get the Ip of the instance and run the pipeline') {
         
            steps {
                  
                script {
                        try{  
                            sh '''
                            
                                echo $Instance_IP

                            '''
                            withCredentials([sshUserPrivateKey(credentialsId: 'ssh', keyFileVariable: 'MY_SSH_KEY')]) {

                                sh '''
                                PGHOST=$(aws ssm get-parameter --name "PGHOST" --query "Parameter.Value" --output text)
                                ENDPOINT_ID=$(aws ssm get-parameter --name "ENDPOINT_ID" --query "Parameter.Value" --output text)
                                PGDATABASE=$(aws ssm get-parameter --name "PGDATABASE" --query "Parameter.Value" --output text)
                                PGPASSWORD=$(aws ssm get-parameter --name "PGPASSWORD" --query "Parameter.Value" --output text)
                                PGUSER=$(aws ssm get-parameter --name "PGUSER" --query "Parameter.Value" --output text)

                                echo "PGHOST=${PGHOST}" > .env
                                    echo "ENDPOINT_ID=${ENDPOINT_ID}" >> .env
                                    echo "PGDATABASE=${PGDATABASE}" >> .env
                                    echo "PGPASSWORD=${PGPASSWORD}" >> .env
                                    echo "PGUSER=${PGUSER}" >> .env

                                    # Print the .env file content for verification
                                    cat .env

                                    # Transfer .env file to EC2 instance
                                scp -o StrictHostKeyChecking=no -i $MY_SSH_KEY .env ubuntu@$Instance_IP:~/
                                
                                ssh -i $MY_SSH_KEY ubuntu@$Instance_IP "source ~/.nvm/nvm.sh && echo $PATH && git clone https://github.com/dhruv160410116084/React-WebRTC-videocall-app.git && mv .env ./React-WebRTC-videocall-app/backend && cd React-WebRTC-videocall-app && pwd && chmod +x start.sh && ./start.sh"
                                
                                '''
                            }

                              sh "echo ${env.INSTANCE_ID} && aws autoscaling record-lifecycle-action-heartbeat --lifecycle-hook-name hook --auto-scaling-group-name asg --instance-id ${env.INSTANCE_ID}"
                              sh "aws autoscaling complete-lifecycle-action --lifecycle-action-result CONTINUE --instance-id ${env.INSTANCE_ID} --lifecycle-hook-name hook --auto-scaling-group-name asg"

                        } catch (e){
                            
                            if (autoCancelled) {
                                currentBuild.result = 'SUCCESS'
                                // return here instead of throwing error to keep the build "green"
                                return
                            }
                            // normal error handling
                            throw e
                        } 
                }
           
            }
           
        }
        
    }
    
}
