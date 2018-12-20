#!groovy

node {
	checkout()
	userApproval3()
	masterDevDeploy()
}

/* ### def stages ### */

def checkout () {
	stage 'Checkout'
	deleteDir()
	checkout scm
}

def masterDevDeploy () {
	stage 'Deploy'
	openshiftBuild(buildConfig: 'nodejs8')
    openshiftVerifyDeployment(deploymentConfig: 'nodejs8', verbose: 'false', waitTime: '10', waitUnit: 'min')
}

def userApproval3 () {
	stage 'userApproval'
	try {
		input message: 'Is this version ready?', id: 'input1'
	} catch (err) {
		error ("Aborted Here2") 
	}
}
