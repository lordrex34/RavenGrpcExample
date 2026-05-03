// Fill out your copyright notice in the Description page of Project Settings.


#include "Actors/ExampleCppWorldData.h"

#include "Engine/Engine.h"
#include "Engine/GameInstance.h"
#include "GameInstance/RavenGrpcClientSubsystem.h"
#include "Services/World/ProtoWorldService.h"
#include "Structs/World/ProtoGetMyWorldRequest.h"
#include "Structs/World/ProtoGetMyWorldResponse.h"

// Sets default values
AExampleCppWorldData::AExampleCppWorldData()
{
	PrimaryActorTick.bCanEverTick = false;
}

// Called when the game starts or when spawned
void AExampleCppWorldData::BeginPlay()
{
	Super::BeginPlay();

	UGameInstance* GameInstance = GetGameInstance();
	URavenGrpcClientSubsystem* GrpcSubsystem = GameInstance
		? GameInstance->GetSubsystem<URavenGrpcClientSubsystem>()
		: nullptr;

	if (!GrpcSubsystem)
	{
		const FString ErrorMessage = TEXT("World data request failed: Raven GRPC client subsystem is unavailable.");
		UE_LOG(LogTemp, Warning, TEXT("%s"), *ErrorMessage);

		if (GEngine)
		{
			GEngine->AddOnScreenDebugMessage(-1, 8.0f, FColor::Red, ErrorMessage);
		}

		return;
	}

	FProtoGetMyWorldRequest Request;
	Request.WorldId = WorldId;

	UProtoWorldService::GetMyWorld(
		GrpcSubsystem,
		Request,
		[RequestedWorldId = WorldId](const FProtoGetMyWorldResponse& Response, bool bSuccess)
		{
			const FString Message = bSuccess
				? FString::Printf(TEXT("World data: %s"), *Response.WorldStatus.ToString())
				: FString::Printf(TEXT("World data request failed for world id %d."), RequestedWorldId);

			UE_LOG(LogTemp, Log, TEXT("%s"), *Message);

			if (GEngine)
			{
				GEngine->AddOnScreenDebugMessage(-1, 10.0f, bSuccess ? FColor::Cyan : FColor::Red, Message);
			}
		}
	);
}

