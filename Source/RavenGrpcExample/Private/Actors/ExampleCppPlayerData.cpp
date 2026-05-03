// Fill out your copyright notice in the Description page of Project Settings.


#include "Actors/ExampleCppPlayerData.h"

#include "Engine/Engine.h"
#include "Engine/GameInstance.h"
#include "GameInstance/RavenGrpcClientSubsystem.h"
#include "Services/Player/ProtoPlayerService.h"
#include "Structs/Player/ProtoGetPlayerRequest.h"
#include "Structs/Player/ProtoGetPlayerResponse.h"

// Sets default values
AExampleCppPlayerData::AExampleCppPlayerData()
{
	PrimaryActorTick.bCanEverTick = false;
}

// Called when the game starts or when spawned
void AExampleCppPlayerData::BeginPlay()
{
	Super::BeginPlay();

	UGameInstance* GameInstance = GetGameInstance();
	URavenGrpcClientSubsystem* GrpcSubsystem = GameInstance
		? GameInstance->GetSubsystem<URavenGrpcClientSubsystem>()
		: nullptr;

	if (!GrpcSubsystem)
	{
		const FString ErrorMessage = TEXT("Player data request failed: Raven GRPC client subsystem is unavailable.");
		UE_LOG(LogTemp, Warning, TEXT("%s"), *ErrorMessage);

		if (GEngine)
		{
			GEngine->AddOnScreenDebugMessage(-1, 8.0f, FColor::Red, ErrorMessage);
		}

		return;
	}

	FProtoGetPlayerRequest Request;
	Request.PlayerId = PlayerId;

	UProtoPlayerService::GetPlayer(
		GrpcSubsystem,
		Request,
		[RequestedPlayerId = PlayerId](const FProtoGetPlayerResponse& Response, bool bSuccess)
		{
			const FString Message = bSuccess
				? FString::Printf(TEXT("Player data: %s"), *Response.Player.ToString())
				: FString::Printf(TEXT("Player data request failed for player id %d."), RequestedPlayerId);

			UE_LOG(LogTemp, Log, TEXT("%s"), *Message);

			if (GEngine)
			{
				GEngine->AddOnScreenDebugMessage(-1, 10.0f, bSuccess ? FColor::Green : FColor::Red, Message);
			}
		}
	);
}

