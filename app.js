let app = angular.module('testApp', []);
app.controller("indexCtrl", ["$scope", "$http", "$interval", "$timeout", ($scope, $http, $interval, $timeout) => {
  $scope.loading = true;
  $scope.messages = [];
  $scope.messagesReaders = [];
  $scope.messagesHistory = []
  $scope.voices = [];
  $scope.init = async () => {
    console.log("Iniciando");
    $scope.data = [];
    $scope.getMessages();
    $scope.voices = speechSynthesis.getVoices();
    // $scope.$apply();
    $interval(() => {
      $scope.getMessages();
    }, 4000);
    loadVoices();
    
    // Timeout de respaldo por si el evento no se dispara
    $timeout(function() {
        if ($scope.voices.length === 0) {
            loadVoices();
        }
    }, 100);
  }

  function loadVoices() {
        $scope.voices = speechSynthesis.getVoices();
        
        if ($scope.voices.length > 0) {
            console.log('Voces cargadas:', $scope.voices.length);
            // Seleccionar una voz en español por defecto
            const spanishVoice = $scope.voices.find(v => v.lang.includes('es'));
            $scope.selectedVoice = spanishVoice || $scope.voices[0];
            
            // Forzar actualización de la vista
            $scope.$apply();
        }
    }
    
    // Escuchar evento cuando las voces estén listas
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    // También intentar cargar inmediatamente (por si ya están cargadas)
    

  $scope.getMessages = () => {
    $http({
      method: 'GET',
      url: 'https://script.googleusercontent.com/macros/echo?user_content_key=AWDtjMX3WV8usGcDYAbLUh9uuEcAvHgU45fULdcb7eW4uLq1GRXoW0t6yIThYmrSgVhRpVr2Ea2QeXGnQtoLayjmi9TcUZyQS2gkoe6LsKVcMS7R85B9kk1gc0gx41DAFjkSMmaXk_IE7X5TBP8TMeaNdngpJSB5PxLEcH2n6FtR24vxR7kHiYETeZ-L5NzGJfOa2Gz-uDc_5Ja1QEYl2bXu-RN3uu44N2WgoS2AdUH0Zo3T3KkVA4rbXRA-cLDFIT5mciRujfo-1RP6fULmuvyIX5RpbosFu29RNcgS53NccdPkPjkpQlRMh3BH2zPYUR6Z8DYhkglkI88CrpCrQV45IBtLXm0rpx8_4C66H_f2&lib=MBpnYoQC9kIRVKUWmNT7VdR5R5kpjQIbB'
    }).then(function(response) {
      // éxito
      $scope.data = response.data;
      $scope.parseMessages();
    }, function(error) {
      // error
      console.error(error);
    });
  }

  $scope.parseMessages = () => {
    $scope.messages = [];
    let headers = {
      "Marca temporal": "createdAt",
      "Genero": "gender",
      "Mensaje": "message"
    };
    $scope.data.map(d => {
      let newMessage = {};
      Object.keys(headers).map(k => {
        newMessage[headers[k]] = d[k];
      });
      $scope.messages.push(newMessage);
    })

    $scope.messages.map(m => {
      m.id = `${m.createdAt}-${m.gender}`;
      if (!$scope.messagesHistory.map(m => m.id).includes(m.id)) {
        $scope.messagesHistory.push(m);
      }
    });
    console.log($scope.messagesHistory);
    $scope.talkMessages();
  }

  $scope.talkMessages = () => {
    // $scope.voiceSelected = 
    console.log($scope.voices);
    let voiceSelected = $scope.voices.find(v => v.lang === 'es-ES');
    $scope.messagesHistory.map(m => {
      const utterance = new SpeechSynthesisUtterance(m.message);
      const selectedVoice = voiceSelected;
      utterance.voice = selectedVoice;
      if (selectedVoice) {
      }
      
      utterance.rate = 1;
      utterance.lang = 'es-ES';
      utterance.pitch = 1;
      
      utterance.onstart = () => {
          $scope.speaking = true;
          showStatus('🎤 Reproduciendo...', 'info');
          if (!$scope.$$phase) $scope.$apply();
          resolve();
      };

      speechSynthesis.speak(utterance);
    })
  }

  $scope.genders = [
    {id: 1, name: 'Masculino'},
    {id: 2, name: 'Femenino'},
  ];
}])